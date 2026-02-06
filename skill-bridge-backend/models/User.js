const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile Info
  role: { type: String, default: "Member" }, 
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' }, // <--- ADD THIS
  category: { type: String, default: "Tech" },
  
  skillsOffered: [String],
  skillsWanted:  [String],

  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);