const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid email address'
      });
    }

    const user = await User.createUser({ email, password, firstName, lastName });
    const token = User.generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = await User.authenticateUser(email, password);
    const token = User.generateToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Logout (client-side token removal, but we can track it server-side if needed)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Update email
router.put('/update-email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address' });
    }

    const updatedEmail = await User.updateEmail(req.user.id, email);
    res.json({ success: true, message: 'Email updated successfully', email: updatedEmail });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update password
router.put('/update-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current and new password are required' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
    }

    await User.updatePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete account
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    await User.deleteAccount(req.user.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;