import express from 'express';
import { db, storage } from '../config/firebase.js';
import { authenticateToken } from '../middlewares/auth.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get posts with pagination and sorting
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'hot', 
      community = null 
    } = req.query;

    let query = db.collection('posts');

    // Filter by community if specified
    if (community) {
      query = query.where('community', '==', community);
    }

    // Apply sorting
    switch (sort) {
      case 'new':
        query = query.orderBy('createdAt', 'desc');
        break;
      case 'top':
        query = query.orderBy('score', 'desc');
        break;
      case 'hot':
      default:
        // Hot algorithm: score / (age in hours + 2)^1.8
        query = query.orderBy('hotScore', 'desc');
        break;
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.offset(offset).limit(parseInt(limit));

    const snapshot = await query.get();
    const posts = [];

    for (const doc of snapshot.docs) {
      const postData = doc.data();
      
      // Get author info
      const authorDoc = await db.collection('users').doc(postData.authorId).get();
      const authorData = authorDoc.exists ? authorDoc.data() : null;

      posts.push({
        id: doc.id,
        ...postData,
        createdAt: postData.createdAt.toDate(),
        updatedAt: postData.updatedAt.toDate(),
        author: authorData ? {
          uid: authorData.uid,
          displayName: authorData.displayName,
          photoURL: authorData.photoURL
        } : null
      });
    }

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const postDoc = await db.collection('posts').doc(req.params.id).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();
    
    // Get author info
    const authorDoc = await db.collection('users').doc(postData.authorId).get();
    const authorData = authorDoc.exists ? authorDoc.data() : null;

    const post = {
      id: postDoc.id,
      ...postData,
      createdAt: postData.createdAt.toDate(),
      updatedAt: postData.updatedAt.toDate(),
      author: authorData ? {
        uid: authorData.uid,
        displayName: authorData.displayName,
        photoURL: authorData.photoURL
      } : null
    };

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create new post
router.post('/', authenticateToken, upload.single('media'), async (req, res) => {
  try {
    const { title, content, community, tags } = req.body;
    const uid = req.user.uid;

    if (!title || !community) {
      return res.status(400).json({ error: 'Title and community are required' });
    }

    let mediaUrl = '';
    let mediaType = '';

    // Upload media file if provided
    if (req.file) {
      const fileName = `${uuidv4()}_${req.file.originalname}`;
      const file = storage.bucket().file(`posts/${fileName}`);
      
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
        },
      });

      await file.makePublic();
      mediaUrl = `https://storage.googleapis.com/${storage.bucket().name}/posts/${fileName}`;
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const now = new Date();
    const postData = {
      title: title.trim(),
      content: content?.trim() || '',
      community,
      tags: tags ? JSON.parse(tags) : [],
      authorId: uid,
      mediaUrl,
      mediaType,
      upvotes: 1, // Author automatically upvotes
      downvotes: 0,
      score: 1,
      hotScore: 1,
      commentCount: 0,
      createdAt: now,
      updatedAt: now,
      isFeatured: false,
      isDeleted: false
    };

    const docRef = await db.collection('posts').add(postData);

    // Update user's karma
    await db.collection('users').doc(uid).update({
      karma: admin.firestore.FieldValue.increment(1)
    });

    res.status(201).json({
      message: 'Post created successfully',
      postId: docRef.id
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Vote on post
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote', 'downvote', or 'remove'
    const postId = req.params.id;
    const uid = req.user.uid;

    if (!['upvote', 'downvote', 'remove'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const batch = db.batch();
    const voteRef = db.collection('votes').doc(`${postId}_${uid}`);
    const postRef = db.collection('posts').doc(postId);

    // Get existing vote
    const existingVote = await voteRef.get();
    const postDoc = await postRef.get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();
    let upvoteChange = 0;
    let downvoteChange = 0;

    if (existingVote.exists) {
      const currentVote = existingVote.data().type;
      
      // Remove current vote effects
      if (currentVote === 'upvote') {
        upvoteChange -= 1;
      } else if (currentVote === 'downvote') {
        downvoteChange -= 1;
      }
    }

    if (voteType === 'remove') {
      batch.delete(voteRef);
    } else {
      // Apply new vote effects
      if (voteType === 'upvote') {
        upvoteChange += 1;
      } else if (voteType === 'downvote') {
        downvoteChange += 1;
      }

      batch.set(voteRef, {
        postId,
        userId: uid,
        type: voteType,
        createdAt: new Date()
      });
    }

    // Update post scores
    const newUpvotes = postData.upvotes + upvoteChange;
    const newDownvotes = postData.downvotes + downvoteChange;
    const newScore = newUpvotes - newDownvotes;
    
    // Calculate hot score (simplified Reddit algorithm)
    const ageInHours = (new Date() - postData.createdAt.toDate()) / (1000 * 60 * 60);
    const hotScore = newScore / Math.pow(ageInHours + 2, 1.8);

    batch.update(postRef, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore,
      hotScore: hotScore,
      updatedAt: new Date()
    });

    await batch.commit();

    res.json({ 
      message: 'Vote recorded successfully',
      newScore: newScore
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const uid = req.user.uid;

    const postDoc = await db.collection('posts').doc(postId).get();

    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postDoc.data();

    // Check if user owns the post or is admin
    if (postData.authorId !== uid) {
      const userRecord = await auth.getUser(uid);
      const customClaims = userRecord.customClaims || {};
      
      if (!customClaims.admin) {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }
    }

    // Soft delete
    await db.collection('posts').doc(postId).update({
      isDeleted: true,
      updatedAt: new Date()
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

export default router;