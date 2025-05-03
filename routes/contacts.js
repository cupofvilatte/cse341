const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// Get Mongo URI from .env
const uri = process.env.MONGO_URI;

// Setup Mongo client
const client = new MongoClient(uri);
let contactsCollection;

// Connect once and reuse
client.connect().then(() => {
  const db = client.db('cse341Database');
  contactsCollection = db.collection('contacts');
});

// GET all contacts
router.get('/', async (req, res) => {
  try {
    const contacts = await contactsCollection.find().toArray();
    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching contacts");
  }
});

// GET contact by ID (query param ?id=...)
router.get('/one', async (req, res) => {
  const id = req.query.id;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send("Invalid ID");
  }

  try {
    const contact = await contactsCollection.findOne({ _id: new ObjectId(id) });
    if (!contact) return res.status(404).send("Contact not found");
    res.json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching contact");
  }
});

module.exports = router;
