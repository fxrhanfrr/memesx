import express from 'express';
import { auth, db } from '../config/firebase.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Register user (create profile after Firebase auth)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { displayName, bio } = req.body;
    const uid = req.user.uid;

    // Create user profile in Firestore
    const userProfile = {
      uid,
      email: req.user.email,
      displayName: displayName || req.user.name || 'Anonymous',
      bio: bio || '',
      photoURL: req.user.picture || '',
      karma: 0,
      joinedCommunities: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isAdmin: false,
      isBanned: false
    };

    await db.collection('users').doc(uid).set(userProfile);

    res.status(201).json({
      message: 'User profile created successfully',
      user: userProfile
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to create user profile' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userData = userDoc.data();
    res.json({ user: userData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { displayName, bio } = req.body;

    const updateData = {
      updatedAt: new Date()
    };

    if (displayName) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;

    await db.collection('users').doc(uid).update(updateData);

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Verify token endpoint
router.post('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      uid: req.user.uid,
      email: req.user.email,
      name: req.user.name
    }
  });
});

export default router;