const express = require('express');
const jwt = require('jsonwebtoken');
const Supervisor = require('../models/Supervisor');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if supervisor already exists
    const existingSupervisor = await Supervisor.findOne({ email });
    if (existingSupervisor) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create new supervisor
    const supervisor = new Supervisor({ name, email, password });
    await supervisor.save();

    // Generate JWT token
    const token = jwt.sign({ id: supervisor._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.status(201).json({
      message: 'Supervisor created successfully',
      token,
      supervisor: {
        id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        themePreference: supervisor.themePreference
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find supervisor
    const supervisor = await Supervisor.findOne({ email });
    if (!supervisor) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await supervisor.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: supervisor._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      message: 'Login successful',
      token,
      supervisor: {
        id: supervisor._id,
        name: supervisor.name,
        email: supervisor.email,
        themePreference: supervisor.themePreference
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Google Login placeholder
router.post('/google-login', async (req, res) => {
  // Placeholder for Google OAuth implementation
  res.json({ message: 'Google login not implemented yet' });
});

module.exports = router;