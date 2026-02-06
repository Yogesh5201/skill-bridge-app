const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection'); // Import the new model

// GET /api/connect/:userId - Get ALL connections (requests sent & received)
router.get('/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { requester: req.params.userId },
        { recipient: req.params.userId }
      ]
    })
    // POPULATE converts "ID" into actual "User Data" (username, etc.)
    // This is CRITICAL for the dashboard to know who sent the request.
    .populate('requester', 'username email role')
    .populate('recipient', 'username email role');

    res.json(connections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/connect/request - Create a new request
router.post('/request', async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;

    // Check if connection already exists
    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existing) {
      return res.status(400).json({ message: "Connection already exists" });
    }

    const newConnection = new Connection({
      requester: requesterId,
      recipient: recipientId,
      status: 'pending'
    });

    await newConnection.save();
    res.json(newConnection);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/connect/accept - Accept a request
router.put('/accept', async (req, res) => {
  try {
    const { connectionId } = req.body;
    
    const updatedConnection = await Connection.findByIdAndUpdate(
      connectionId,
      { status: 'accepted' },
      { new: true }
    );

    res.json(updatedConnection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;