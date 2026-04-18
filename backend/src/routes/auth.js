const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper: generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: username.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id:       req.user._id,
      username: req.user.username,
      name:     req.user.name,
      role:     req.user.role,
    },
  });
});

// ── POST /api/auth/register (admin only in production — open for setup) ───────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const existingUser = await User.findOne({ 
      $or: [
        { username: username?.toLowerCase() },
        { email: email?.toLowerCase() }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username or Email already exists' });
    }

    const user = await User.create({ 
      username, 
      email, 
      password, 
      name: name || '', 
      role: role || 'staff' 
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
