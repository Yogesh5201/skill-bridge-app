const router = require('express').Router();
const Connection = require('../models/Connection');
const User = require('../models/User');

// 1. Send a Connection Request
router.post('/request', async (req, res) => {
  try {
    const newConnection = new Connection({
      requester: req.body.requesterId,
      recipient: req.body.recipientId
    });
    await newConnection.save();
    res.json(newConnection);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. Accept a Request
router.put('/accept', async (req, res) => {
  try {
    const conn = await Connection.findByIdAndUpdate(
      req.body.connectionId, 
      { status: 'accepted' }, 
      { new: true }
    );
    res.json(conn);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. Get All My Connections (Pending & Accepted)
// We need this to know WHICH button to show (Connect vs Chat)
router.get('/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.params.userId },
        { recipient: req.params.userId }
      ]
    }).populate('requester', 'username').populate('recipient', 'username');
    
    res.json(connections);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;