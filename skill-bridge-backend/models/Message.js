const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  // We use the Connection ID as the "Room ID"
  connectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }, 
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);