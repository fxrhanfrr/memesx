import express from 'express';
import { db, auth } from '../config/firebase.js';
import admin from '../config/firebase.js'; // Added this line
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [usersSnapshot, postsSnapshot, commentsSnapshot, communitiesSnapshot] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('posts').where('isDeleted', '==', false).count().get(),
      db.collection('comments').where('isDeleted', '==', false).count().get(),
      db.collection('communities').where('isActive', '==', true).count().get()
    ]);

    const stats = {
      totalUsers: usersSnapshot.data().count,
      totalPosts: postsSnapshot.data().count,
      totalComments: commentsSnapshot.data().count,
      totalCommunities: communitiesSnapshot.data().count,
      generatedAt: new Date()
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// Get reported content
router.get('/reports', async (req, res) => {
  try {
    const { page = 1, limit = 20, type = 'all' } = req.query;

    let query = db.collection('reports')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc');

    if (type !== 'all') {
      query = query.where('type', '==', type);
    }

    const snapshot = await query
      .offset((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .get();

    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    }));

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reports.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Ban user
router.post('/users/:uid/ban', async (req, res) => {
  try {
    const { uid } = req.params;
    const { reason, duration } = req.body; // duration in days, null for permanent

    // Update user status
    await db.collection('users').doc(uid).update({
      isBanned: true,
      banReason: reason || 'Violation of community guidelines',
      banDuration: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null,
      bannedAt: new Date(),
      bannedBy: req.user.uid,
      updatedAt: new Date()
    });

    // Disable Firebase Auth account
    await auth.updateUser(uid, { disabled: true });

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// Unban user
router.post('/users/:uid/unban', async (req, res) => {
  try {
    const { uid } = req.params;

    // Update user status
    await db.collection('users').doc(uid).update({
      isBanned: false,
      banReason: null,
      banDuration: null,
      bannedAt: null,
      bannedBy: null,
      unbannedAt: new Date(),
      unbannedBy: req.user.uid,
      updatedAt: new Date()
    });

    // Enable Firebase Auth account
    await auth.updateUser(uid, { disabled: false });

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Failed to unban user' });
  }
});

// Delete post (admin)
router.delete('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const { reason } = req.body;

    await db.collection('posts').doc(postId).update({
      isDeleted: true,
      deletedBy: req.user.uid,
      deletedAt: new Date(),
      deleteReason: reason || 'Removed by admin',
      updatedAt: new Date()
    });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Admin delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Feature post
router.post('/posts/:id/feature', async (req, res) => {
  try {
    const postId = req.params.id;

    await db.collection('posts').doc(postId).update({
      isFeatured: true,
      featuredAt: new Date(),
      featuredBy: req.user.uid,
      updatedAt: new Date()
    });

    res.json({ message: 'Post featured successfully' });
  } catch (error) {
    console.error('Feature post error:', error);
    res.status(500).json({ error: 'Failed to feature post' });
  }
});

// Unfeature post
router.post('/posts/:id/unfeature', async (req, res) => {
  try {
    const postId = req.params.id;

    await db.collection('posts').doc(postId).update({
      isFeatured: false,
      featuredAt: null,
      featuredBy: null,
      updatedAt: new Date()
    });

    res.json({ message: 'Post unfeatured successfully' });
  } catch (error) {
    console.error('Unfeature post error:', error);
    res.status(500).json({ error: 'Failed to unfeature post' });
  }
});

// Get all users (admin)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', banned = 'all' } = req.query;

    let query = db.collection('users').orderBy('createdAt', 'desc');

    if (banned === 'true') {
      query = query.where('isBanned', '==', true);
    } else if (banned === 'false') {
      query = query.where('isBanned', '==', false);
    }

    const snapshot = await query
      .offset((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .get();

    let users = snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      bannedAt: doc.data().bannedAt?.toDate() || null,
      unbannedAt: doc.data().unbannedAt?.toDate() || null
    }));

    // Filter by search if provided
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.displayName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: users.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Make user admin
router.post('/users/:uid/make-admin', async (req, res) => {
  try {
    const { uid } = req.params;

    // Set custom claims
    await auth.setCustomUserClaims(uid, { admin: true });

    // Update user document
    await db.collection('users').doc(uid).update({
      isAdmin: true,
      adminSince: new Date(),
      updatedAt: new Date()
    });

    res.json({ message: 'User promoted to admin successfully' });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Failed to make user admin' });
  }
});

// Remove admin privileges
router.post('/users/:uid/remove-admin', async (req, res) => {
  try {
    const { uid } = req.params;

    // Remove custom claims
    await auth.setCustomUserClaims(uid, { admin: false });

    // Update user document
    await db.collection('users').doc(uid).update({
      isAdmin: false,
      adminSince: null,
      updatedAt: new Date()
    });

    res.json({ message: 'Admin privileges removed successfully' });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ error: 'Failed to remove admin privileges' });
  }
});

export default router;