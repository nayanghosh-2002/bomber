const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


router.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hashedPassword, role: role || 'user' });
    await user.save();

    res.status(201).json({ message: 'User registered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token, role: user.role, username: user.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
