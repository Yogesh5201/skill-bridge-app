const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' }
});

module.exports = mongoose.model('Session', SessionSchema);