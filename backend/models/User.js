const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  points: { type: Number, default: 0 },
  badge: { type: String, default: 'New User' }
});
module.exports = mongoose.model('User', userSchema);
