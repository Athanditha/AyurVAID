const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Store user profile after dosha analysis
router.post('/store', authenticateToken, async (req, res) => {
  try {
    const { analysis, userInfo } = req.body;

    if (!analysis) {
      return res.status(400).json({
        success: false,
        error: 'Analysis data required'
      });
    }

    const profileId = await User.addUserProfile(req.user.id, {
      analysis,
      userInfo: userInfo || {}
    });

    res.json({
      success: true,
      profileId,
      message: 'Profile stored successfully'
    });
  } catch (error) {
    console.error('Profile storage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to store profile'
    });
  }
});

// Get all user profiles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const profiles = await User.getUserProfiles(req.user.id);

    res.json({
      success: true,
      profiles
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profiles'
    });
  }
});

// Get specific user profile
router.get('/:profileId', authenticateToken, async (req, res) => {
  try {
    const { profileId } = req.params;
    const profile = await User.getUserProfile(req.user.id, profileId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile'
    });
  }
});

module.exports = router;