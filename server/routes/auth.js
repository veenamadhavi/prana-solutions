const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Caregiver = require('../models/Caregiver');
const { auth } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'prana_solutions_secret_2024';

// 🔹 Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

//
// 🔹 SIGNUP ROUTE
//
router.post('/signup', async (req, res) => {
  try {
    console.log("Signup request received:", req.body); // DEBUG

    const {
      name,
      email,
      password,
      role,
      phone,
      specializations,
      experience,
      bio
    } = req.body;

    // ✅ Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // ✅ Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // ✅ Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      phone
    });

    // ✅ If caregiver → create caregiver profile
    if (role === 'caregiver') {
      await Caregiver.create({
        user: user._id,
        specializations: specializations || [],
        experience: experience || 0,
        bio: bio || '',
        isVerified: false
      });
    }

    // ✅ Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Signup successful ✅',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

//
// 🔹 LOGIN ROUTE
//
router.post('/login', async (req, res) => {
  try {
    console.log("Login request:", req.body); // DEBUG

    const { email, password } = req.body;

    // ✅ Validate
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful ✅',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

//
// 🔹 GET CURRENT USER
//
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    console.error("Fetch user error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;