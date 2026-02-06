// routes/match.js
const router = require('express').Router();
const User = require('../models/User');

// GET MATCHES FOR A USER
router.get('/:userId', async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) return res.status(404).send("User not found");

    // 1. PERFECT MATCH (Double Coincidence of Wants)
    // Find users who have what I want AND want what I have
    const perfectMatches = await User.find({
      _id: { $ne: currentUser._id }, // Not me
      skillsOffered: { $in: currentUser.skillsWanted }, // They offer what I want
      skillsWanted: { $in: currentUser.skillsOffered }  // They want what I offer
    });

    // 2. POTENTIAL MATCH (One-Way)
    // Find users who have what I want (but maybe don't need my skill)
    // We exclude users already found in perfectMatches
    const perfectMatchIds = perfectMatches.map(user => user._id);
    
    const potentialMatches = await User.find({
      _id: { $ne: currentUser._id, $nin: perfectMatchIds },
      skillsOffered: { $in: currentUser.skillsWanted }
    });

    res.json({
      currentUser: currentUser.username,
      perfectMatches: perfectMatches,
      potentialMatches: potentialMatches
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;