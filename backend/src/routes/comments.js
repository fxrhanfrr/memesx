import express from 'express';
import { db } from '../config/firebase.js';
import admin from '../config/firebase.js'; // Added this line
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const query = db.collection('comments')
      .where('postId', '==', postId)
      .where('isDeleted', '==', false)
      .orderBy('createdAt', 'desc')
      .offset((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const snapshot = await query.get();
    const comments = [];

    for (const doc of snapshot.docs) {
      const commentData = doc.data();
      
      // Get author info
      const authorDoc = await db.collection('users').doc(commentData.authorId).get();
      const authorData = authorDoc.exists ? authorDoc.data() : null;

      comments.push({
        id: doc.id,
        ...commentData,
        createdAt: commentData.createdAt.toDate(),
        updatedAt: commentData.updatedAt.toDate(),
        author: authorData ? {
          uid: authorData.uid,
          displayName: authorData.displayName,
          photoURL: authorData.photoURL
        } : null
      });
    }

    // Build threaded structure
    const threadedComments = buildCommentTree(comments);

    res.json({
      comments: threadedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: comments.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Create comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { postId, content, parentId = null } = req.body;
    const uid = req.user.uid;

    if (!postId || !content?.trim()) {
      return res.status(400).json({ error: 'Post ID and content are required' });
    }

    // Verify post exists
    const postDoc = await db.collection('posts').doc(postId).get();
    if (!postDoc.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify parent comment exists if specified
    if (parentId) {
      const parentDoc = await db.collection('comments').doc(parentId).get();
      if (!parentDoc.exists) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
    }

    const now = new Date();
    const commentData = {
      postId,
      content: content.trim(),
      authorId: uid,
      parentId,
      upvotes: 1, // Author automatically upvotes
      downvotes: 0,
      score: 1,
      replyCount: 0,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      isEdited: false
    };

    const batch = db.batch();
    const commentRef = db.collection('comments').doc();
    
    batch.set(commentRef, commentData);

    // Update post comment count
    batch.update(db.collection('posts').doc(postId), {
      commentCount: admin.firestore.FieldValue.increment(1),
      updatedAt: now
    });

    // Update parent comment reply count if this is a reply
    if (parentId) {
      batch.update(db.collection('comments').doc(parentId), {
        replyCount: admin.firestore.FieldValue.increment(1),
        updatedAt: now
      });
    }

    // Update user karma
    batch.update(db.collection('users').doc(uid), {
      karma: admin.firestore.FieldValue.increment(1)
    });

    await batch.commit();

    res.status(201).json({
      message: 'Comment created successfully',
      commentId: commentRef.id
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Vote on comment
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { voteType } = req.body;
    const commentId = req.params.id;
    const uid = req.user.uid;

    if (!['upvote', 'downvote', 'remove'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const batch = db.batch();
    const voteRef = db.collection('commentVotes').doc(`${commentId}_${uid}`);
    const commentRef = db.collection('comments').doc(commentId);

    const existingVote = await voteRef.get();
    const commentDoc = await commentRef.get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();
    let upvoteChange = 0;
    let downvoteChange = 0;

    if (existingVote.exists) {
      const currentVote = existingVote.data().type;
      if (currentVote === 'upvote') {
        upvoteChange -= 1;
      } else if (currentVote === 'downvote') {
        downvoteChange -= 1;
      }
    }

    if (voteType === 'remove') {
      batch.delete(voteRef);
    } else {
      if (voteType === 'upvote') {
        upvoteChange += 1;
      } else if (voteType === 'downvote') {
        downvoteChange += 1;
      }

      batch.set(voteRef, {
        commentId,
        userId: uid,
        type: voteType,
        createdAt: new Date()
      });
    }

    const newUpvotes = commentData.upvotes + upvoteChange;
    const newDownvotes = commentData.downvotes + downvoteChange;
    const newScore = newUpvotes - newDownvotes;

    batch.update(commentRef, {
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      score: newScore,
      updatedAt: new Date()
    });

    await batch.commit();

    res.json({ 
      message: 'Vote recorded successfully',
      newScore: newScore
    });
  } catch (error) {
    console.error('Comment vote error:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Edit comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const commentId = req.params.id;
    const uid = req.user.uid;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const commentDoc = await db.collection('comments').doc(commentId).get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    if (commentData.authorId !== uid) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    await db.collection('comments').doc(commentId).update({
      content: content.trim(),
      isEdited: true,
      updatedAt: new Date()
    });

    res.json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).json({ error: 'Failed to edit comment' });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const commentId = req.params.id;
    const uid = req.user.uid;

    const commentDoc = await db.collection('comments').doc(commentId).get();

    if (!commentDoc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const commentData = commentDoc.data();

    // Check if user owns the comment or is admin
    if (commentData.authorId !== uid) {
      const userRecord = await auth.getUser(uid);
      const customClaims = userRecord.customClaims || {};
      
      if (!customClaims.admin) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }
    }

    await db.collection('comments').doc(commentId).update({
      isDeleted: true,
      updatedAt: new Date()
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Helper function to build comment tree
function buildCommentTree(comments) {
  const commentMap = new Map();
  const rootComments = [];

  // First pass: create map of all comments
  comments.forEach(comment => {
    comment.replies = [];
    commentMap.set(comment.id, comment);
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    if (comment.parentId) {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

export default router;