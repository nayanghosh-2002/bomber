
const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');


router.post('/add', async (req, res) => {
  try {
    const { name, phone, email, tags } = req.body;
    if (!name || !phone) return res.status(400).send('Name and phone required');
    const contact = new Contact({ name, phone, email, tags });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send('CSV file required');
    const contacts = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        if(row.name && row.phone) {
          contacts.push({
            name: row.name,
            phone: row.phone,
            email: row.email || undefined,
            tags: row.tags ? row.tags.split(';').map(t => t.trim()) : []
          });
        }
      })
      .on('end', async () => {
        try {
          await Contact.insertMany(contacts, { ordered: false });
          fs.unlinkSync(req.file.path); // clean up uploaded file
          res.status(201).send(`${contacts.length} contacts imported`);
        } catch (insertErr) {
          res.status(500).send('Error inserting contacts: ' + insertErr.message);
        }
      });
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.get('/export', async (req, res) => {
  try {
    const contacts = await Contact.find().lean();
    const fields = ['name', 'phone', 'email', 'tags'];
    const json2csv = new Parser({ fields });
    const csvData = json2csv.parse(contacts);
    res.header('Content-Type', 'text/csv');
    res.attachment('contacts.csv');
    res.send(csvData);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).send('Query parameter q is required');
    const regex = new RegExp(q, 'i'); // case-insensitive
    const results = await Contact.find({
      $or: [
        { name: regex },
        { phone: regex },
        { tags: regex }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
