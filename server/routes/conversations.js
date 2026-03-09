const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Get all user conversations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const conversations = await User.getUserConversations(req.user.id);

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Conversations retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversations'
    });
  }
});

// Create new conversation
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title } = req.body;
    const conversationId = await User.createConversation(req.user.id, title);

    res.status(201).json({
      success: true,
      conversationId,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Conversation creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
});

// Get specific conversation
router.get('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await User.getConversation(req.user.id, conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Conversation retrieval error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation'
    });
  }
});

// Delete conversation
router.delete('/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const success = await User.deleteConversation(req.user.id, conversationId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Conversation deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    });
  }
});

module.exports = router;