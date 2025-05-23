/**
 * @swagger
 * tags:
 *   name: Contacts
 *   description: API for managing contacts
 */

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

/**
 * @swagger
 * /contacts:
 *   get:
 *     summary: Get all contacts
 *     tags: [Contacts]
 *     responses:
 *       200:
 *         description: A list of contacts
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
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

/**
 * @swagger
 * /contacts/:id
 *   get:
 *     summary: Get a single contact by query ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The contact's ObjectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single contact (HTML)
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Contact not found
 */
router.get('/:id', async (req, res) => {

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
        return res.status(400).send("invalid ID");
    }

    try {
        await connectToDatabase(); // Ensure we're connected
        const contact = await contactsCollection.findOne({ _id: new ObjectId(id) });
        if (!contact) return res.status(404).send("Contact not found");

        const html = `
            <h1>Contact Details</h1>
            <p><strong>First Name:</strong> ${contact.firstName}</p>
            <p><strong>Last Name:</strong> ${contact.lastName}</p>
            <p><strong>Email:</strong> ${contact.email}</p>
            <p><strong>Favorite Color:</strong> ${contact.favoriteColor}</p>
            <p><strong>Birthday:</strong> ${contact.birthday}</p>
            <br/>
            <a href="/contacts"><button>Back to All Contacts</button></a>
        `;

        res.send(html);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching contacts");
    }
});


/**
 * @swagger
 * /contacts:
 *   post:
 *     summary: Create a new contact
 *     tags: [Contacts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - favoriteColor
 *               - birthday
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               favoriteColor:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Contact created
 *       400:
 *         description: Missing required fields
 */
router.post('/', express.json(), async (req, res) => {
  await connectToDatabase();

  const { firstName, lastName, email, favoriteColor, birthday } = req.body;

  if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
    return res.status(400).json({ message: 'All fields are required.' })
  }

  try {
    const result = await contactsCollection.insertOne({
      firstName,
      lastName,
      email,
      favoriteColor,
      birthday
    });

    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    console.error('Error inserting contact:', err);
    res.status(500).json({ message: 'Failed to create contact' });
  }
});

/**
 * @swagger
 * /contacts/{id}:
 *   put:
 *     summary: Update a contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The contact ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - favoriteColor
 *               - birthday
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               favoriteColor:
 *                 type: string
 *               birthday:
 *                 type: string
 *                 format: date
 *     responses:
 *       204:
 *         description: Contact updated successfully
 *       400:
 *         description: Invalid ID or missing fields
 *       404:
 *         description: Contact not found
 */
router.put('/:id', express.json(), async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send('Invalid ID format');
  }

  const { firstName, lastName, email, favoriteColor, birthday } = req.body;

  if (!firstName || !lastName || !email || !favoriteColor || !birthday) {
    return res.status(400).send('All fields are required');
  }

  try {
    await connectToDatabase();
    const result = await contactsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          firstName,
          lastName,
          email,
          favoriteColor,
          birthday,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send('Contact not found');
    }

    res.sendStatus(204).json({ message: "Contact updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error updating contact');
  }

});

/**
 * @swagger
 * /contacts/{id}:
 *   delete:
 *     summary: Delete a contact by ID
 *     tags: [Contacts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The contact ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact deleted successfully
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Contact not found
 */
router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  if (!ObjectId.isValid(id)) {
      return res.status(400).send("Invalid ID");
  }

  try {
      await connectToDatabase(); // Ensure DB connection
      const result = await contactsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
          return res.status(404).send("Contact not found");
      }

      res.sendStatus(200).json({ message: "Contact deleted successfully" });
  } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting contact");
  }
});

module.exports = router;