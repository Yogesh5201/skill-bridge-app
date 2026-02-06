const router = require('express').Router();
const User = require('../models/User');

// Rate a User
router.post('/rate', async (req, res) => {
  try {
    const { userId, stars } = req.body;
    const user = await User.findById(userId);
    
    // Calculate new weighted average
    const totalScore = (user.rating * user.ratingCount) + Number(stars);
    user.ratingCount += 1;
    user.rating = totalScore / user.ratingCount;
    
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;