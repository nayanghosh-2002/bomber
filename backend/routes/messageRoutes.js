const express = require('express');
const twilio = require('twilio');
const Message = require('../models/Message');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const fromNumber = process.env.TWILIO_PHONE_NUMBER;


router.post('/send', authenticate, async (req, res) => {
  const { to, body } = req.body;
  try {
    
    const message = new Message({ user: req.user._id, to, body, status: 'pending' });
    await message.save();

    // Send SMS with Twilio
    const sentMsg = await client.messages.create({
      body,
      from: fromNumber,
      to
    });

    
    message.status = 'sent';
    message.dateSent = new Date();
    await message.save();

    res.json({ message: 'SMS sent successfully', sid: sentMsg.sid });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/history', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id }).sort({ dateSent: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get('/all', authenticate, authorizeRoles('admin'), async (req, res) => {
  try {
    const messages = await Message.find().populate('user', 'username').sort({ dateSent: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
