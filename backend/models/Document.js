const mongoose = require('mongoose');
const documentSchema = new mongoose.Schema({
  userId: String,
  fileName: String,
  summary: String,
  trustScore: Number,
  detected: [String],
  uploadDate: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Document', documentSchema);
