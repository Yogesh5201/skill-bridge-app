const router = require('express').Router();
const Message = require('../models/Message');

// 1. Save a new message
router.post('/', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. Get all messages for a specific connection (Load History)
router.get('/:connectionId', async (req, res) => {
  try {
    const messages = await Message.find({ connectionId: req.params.connectionId })
                                  .populate('sender', 'username'); // Get username too
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;