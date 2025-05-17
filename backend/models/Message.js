const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  to: String,
  body: String,
  dateSent: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Message', messageSchema);
