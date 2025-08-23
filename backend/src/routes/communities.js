import express from 'express';
import { db } from '../config/firebase.js';
import admin from '../config/firebase.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Get all communities
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;

    let query = db.collection('communities')
      .where('isActive', '==', true)
      .orderBy('memberCount', 'desc');

    if (search) {
      // Simple search by name (Firestore has limited text search)
      query = query.where('name', '>=', search.toLowerCase())
                   .where('name', '<=', search.toLowerCase() + '\uf8ff');
    }

    const snapshot = await query
      .offset((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .get();

    const communities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    }));

    res.json({
      communities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: communities.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

// Get single community
router.get('/:name', async (req, res) => {
  try {
    const communityName = req.params.name.toLowerCase();
    
    const snapshot = await db.collection('communities')
      .where('name', '==', communityName)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const communityDoc = snapshot.docs[0];
    const community = {
      id: communityDoc.id,
      ...communityDoc.data(),
      createdAt: communityDoc.data().createdAt.toDate(),
      updatedAt: communityDoc.data().updatedAt.toDate()
    };

    res.json({ community });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
});

// Create community
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, rules = [] } = req.body;
    const uid = req.user.uid;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    const communityName = name.toLowerCase().trim();

    // Check if community name is valid
    if (!/^[a-z0-9_]{3,21}$/.test(communityName)) {
      return res.status(400).json({ 
        error: 'Community name must be 3-21 characters, lowercase letters, numbers, and underscores only' 
      });
    }

    // Check if community already exists
    const existingCommunity = await db.collection('communities')
      .where('name', '==', communityName)
      .limit(1)
      .get();

    if (!existingCommunity.empty) {
      return res.status(409).json({ error: 'Community name already taken' });
    }

    const now = new Date();
    const communityData = {
      name: communityName,
      displayName: name.trim(),
      description: description.trim(),
      rules: rules.filter(rule => rule.trim()),
      creatorId: uid,
      moderators: [uid],
      memberCount: 1,
      postCount: 0,
      isActive: true,
      isNSFW: false,
      createdAt: now,
      updatedAt: now
    };

    const batch = db.batch();
    const communityRef = db.collection('communities').doc();
    
    batch.set(communityRef, communityData);

    // Add creator as member
    const membershipRef = db.collection('memberships').doc(`${communityRef.id}_${uid}`);
    batch.set(membershipRef, {
      communityId: communityRef.id,
      userId: uid,
      role: 'moderator',
      joinedAt: now
    });

    // Update user's joined communities
    batch.update(db.collection('users').doc(uid), {
      joinedCommunities: admin.firestore.FieldValue.arrayUnion(communityRef.id)
    });

    await batch.commit();

    res.status(201).json({
      message: 'Community created successfully',
      communityId: communityRef.id,
      name: communityName
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

// Join community
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    const communityId = req.params.id;
    const uid = req.user.uid;

    // Check if community exists
    const communityDoc = await db.collection('communities').doc(communityId).get();
    if (!communityDoc.exists) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if already a member
    const membershipDoc = await db.collection('memberships')
      .doc(`${communityId}_${uid}`)
      .get();

    if (membershipDoc.exists) {
      return res.status(409).json({ error: 'Already a member of this community' });
    }

    const batch = db.batch();
    
    // Add membership
    const membershipRef = db.collection('memberships').doc(`${communityId}_${uid}`);
    batch.set(membershipRef, {
      communityId,
      userId: uid,
      role: 'member',
      joinedAt: new Date()
    });

    // Update community member count
    batch.update(db.collection('communities').doc(communityId), {
      memberCount: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date()
    });

    // Update user's joined communities
    batch.update(db.collection('users').doc(uid), {
      joinedCommunities: admin.firestore.FieldValue.arrayUnion(communityId)
    });

    await batch.commit();

    res.json({ message: 'Successfully joined community' });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

// Leave community
router.post('/:id/leave', authenticateToken, async (req, res) => {
  try {
    const communityId = req.params.id;
    const uid = req.user.uid;

    // Check if member
    const membershipDoc = await db.collection('memberships')
      .doc(`${communityId}_${uid}`)
      .get();

    if (!membershipDoc.exists) {
      return res.status(404).json({ error: 'Not a member of this community' });
    }

    const batch = db.batch();
    
    // Remove membership
    batch.delete(db.collection('memberships').doc(`${communityId}_${uid}`));

    // Update community member count
    batch.update(db.collection('communities').doc(communityId), {
      memberCount: admin.firestore.FieldValue.increment(-1),
      updatedAt: new Date()
    });

    // Update user's joined communities
    batch.update(db.collection('users').doc(uid), {
      joinedCommunities: admin.firestore.FieldValue.arrayRemove(communityId)
    });

    await batch.commit();

    res.json({ message: 'Successfully left community' });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

// Get user's communities
router.get('/user/joined', authenticateToken, async (req, res) => {
  try {
    const uid = req.user.uid;

    const membershipSnapshot = await db.collection('memberships')
      .where('userId', '==', uid)
      .get();

    const communityIds = membershipSnapshot.docs.map(doc => doc.data().communityId);

    if (communityIds.length === 0) {
      return res.json({ communities: [] });
    }

    // Get community details
    const communities = [];
    for (const communityId of communityIds) {
      const communityDoc = await db.collection('communities').doc(communityId).get();
      if (communityDoc.exists) {
        communities.push({
          id: communityDoc.id,
          ...communityDoc.data(),
          createdAt: communityDoc.data().createdAt.toDate(),
          updatedAt: communityDoc.data().updatedAt.toDate()
        });
      }
    }

    res.json({ communities });
  } catch (error) {
    console.error('Get user communities error:', error);
    res.status(500).json({ error: 'Failed to fetch user communities' });
  }
});

export default router;