const router = require('express').Router();
const Session = require('../models/Session');

// 1. Create Session (Book)
router.post('/book', async (req, res) => {
  try {
    const newSession = new Session(req.body);
    await newSession.save();
    res.json(newSession);
  } catch (err) { res.status(500).json(err); }
});

// 2. Get My Sessions (Incoming & Outgoing)
router.get('/:userId', async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [{ requester: req.params.userId }, { recipient: req.params.userId }]
    }).populate('requester recipient', 'username');
    res.json(sessions);
  } catch (err) { res.status(500).json(err); }
});

// 3. Accept a Session (NEW ROUTE)
router.put('/accept', async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.body.sessionId, 
      { status: 'confirmed' }, 
      { new: true }
    );
    res.json(session);
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;