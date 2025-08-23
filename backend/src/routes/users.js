import express from 'express';
import { db } from '../config/firebase.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Get user profile by ID
router.get('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    
    // Remove sensitive information
    const publicProfile = {
      uid: userData.uid,
      displayName: userData.displayName,
      bio: userData.bio,
      photoURL: userData.photoURL,
      karma: userData.karma,
      createdAt: userData.createdAt.toDate(),
      joinedCommunities: userData.joinedCommunities || []
    };

    res.json({ user: publicProfile });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get user's posts
router.get('/:uid/posts', async (req, res) => {
  try {
    const { uid } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = db.collection('posts')
      .where('authorId', '==', uid)
      .where('isDeleted', '==', false)
      .orderBy('createdAt', 'desc')
      .offset((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    }));

    res.json({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get user's comments
router.get('/:uid/comments', async (req, res) => {
  try {
    const { uid } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const query = db.collection('comments')
      .where('authorId', '==', uid)
      .where('isDeleted', '==', false)
      .orderBy('createdAt', 'desc')
      .offset((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const snapshot = await query.get();
    const comments = [];

    for (const doc of snapshot.docs) {
      const commentData = doc.data();
      
      // Get post title for context
      const postDoc = await db.collection('posts').doc(commentData.postId).get();
      const postTitle = postDoc.exists ? postDoc.data().title : 'Deleted Post';

      comments.push({
        id: doc.id,
        ...commentData,
        createdAt: commentData.createdAt.toDate(),
        updatedAt: commentData.updatedAt.toDate(),
        postTitle
      });
    }

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: comments.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({ error: 'Failed to fetch user comments' });
  }
});

// Search users
router.get('/', async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const searchTerm = q.toLowerCase().trim();
    
    const query = db.collection('users')
      .where('displayName', '>=', searchTerm)
      .where('displayName', '<=', searchTerm + '\uf8ff')
      .where('isBanned', '==', false)
      .orderBy('displayName')
      .offset((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => {
      const userData = doc.data();
      return {
        uid: userData.uid,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        karma: userData.karma,
        createdAt: userData.createdAt.toDate()
      };
    });

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;