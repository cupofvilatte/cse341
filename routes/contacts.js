const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// Get Mongo URI from .env
const uri = process.env.MONGO_URI;

// Setup Mongo client
const client = new MongoClient(uri);
let contactsCollection;

const connectToDatabase = async () => {
    if (!contactsCollection) {
      try {
        console.log('Connecting to MongoDB...');
        await client.connect();
        const db = client.db('cse341Database');
        contactsCollection = db.collection('contacts');
        console.log('Connected to MongoDB');
      } catch (error) {
        console.error('Error connecting to MongoDB:', error);
      }
    }
};

connectToDatabase();

router.get('/', async (req, res) => {
    try {
      await connectToDatabase(); // Ensure we're connected
      const contacts = await contactsCollection.find().toArray();
      let html = '<h1>All Contacts</h1>';
      contacts.forEach(contact => {
        html += `<a href="/contacts/one?id=${contact._id}"><button>${contact.firstName} ${contact.lastName}</button></a><br/>`;
      });
      res.send(html);  
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching contacts");
    }
});

router.get('/one', async (req, res) => {

    const id = req.query.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("invalid ID");
    }

    try {
        await connectToDatabase(); // Ensure we're connected
        const contact = await contactsCollection.findOne({ _id: new ObjectId(id) });
        if (!contact) return res.status(404).send("Contact not found");

        const html = `
            <h1>Contact Details</h1>
            <p><strong>Name:</strong> ${contact.firstName} ${contact.lastName}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Phone:</strong> ${contact.phone}</p>
            <br/>
            <a href="/contacts"><button>Back to All Contacts</button></a>
        `;

        res.send(html);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching contacts");
    }
});


module.exports = router;