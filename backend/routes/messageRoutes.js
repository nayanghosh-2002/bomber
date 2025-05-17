const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

router.post('/send', async (req, res) => {
  const { to, body } = req.body;
  try {
    await client.messages.create({ body, from: fromNumber, to });
    const message = new Message({ to, body });
    await message.save();
    res.status(200).send('Message sent and saved');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/history', async (req, res) => {
  try {
    const messages = await Message.find().sort({ dateSent: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
