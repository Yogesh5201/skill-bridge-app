const express = require('express');
const router = express.Router();
const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER ROUTE (Fixed) ---
router.post('/register', async (req, res) => {
  try {
    console.log("📥 Register Request Body:", req.body); // This will show up in Render Logs

    const { email, username, password, gender, category, skills, interests } = req.body;

    // 1. Check for duplicates
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this Email or Username already exists" });
    }

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create User (Standardizing Field Names)
    // We check for 'skills' OR 'skillsOffered' to prevent errors
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      gender: gender || 'Other',
      category: category || 'Tech',
      role: 'Member',
      // Map Frontend 'skills' -> Database 'skillsOffered'
      skillsOffered: skills || req.body.skillsOffered || [],
      // Map Frontend 'interests' -> Database 'skillsWanted'
      skillsWanted: interests || req.body.skillsWanted || []
    });

    const savedUser = await newUser.save();
    
    // 4. Generate Token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

    console.log("✅ User Registered Successfully:", savedUser.username);
    res.status(201).json({ token, ...savedUser._doc });

  } catch (err) {
    console.error("❌ Register Error:", err);
    // Send the ACTUAL error message to the frontend
    res.status(400).json({ message: err.message || "Registration failed" });
  }
});

// --- LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.status(200).json({ token, ...user._doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;