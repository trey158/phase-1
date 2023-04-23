const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectID } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uri = 'mongodb+srv://admin:CMPS415@cluster0.nttgrun.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'ticketsdb';
const collectionName = 'tickets';

// Connect to the database
client.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Connected to MongoDB');
});

// Endpoint to get all tickets
app.get('/rest/list', async (req, res) => {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const tickets = await collection.find().toArray();
  res.send(tickets);
});

// Endpoint to get a single ticket by ID
app.get('/rest/ticket/:id', async (req, res) => {
  const id = req.params.id;
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const ticket = await collection.findOne({ _id: ObjectID(id) });
  if (!ticket) {
    return res.status(404).send('Ticket not found');
  }
  res.send(ticket);
});

// Endpoint to create a new ticket
app.post('/rest/ticket', async (req, res) => {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const newTicket = {
    _id: new ObjectID(),
    created_at: new Date(),
    updated_at: new Date(),
    type: req.body.type,
    subject: req.body.subject,
    description: req.body.description,
    priority: req.body.priority,
    status: req.body.status,
    recipient: req.body.recipient,
    submitter: req.body.submitter,
    assignee_id: req.body.assignee_id,
    follower_ids: req.body.follower_ids,
    tags: req.body.tags,
  };
  const result = await collection.insertOne(newTicket);
  res.send(newTicket);
});

// Endpoint to delete a ticket by ID
app.delete('/rest/ticket/:id', async (req, res) => {
  const id = req.params.id;
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const result = await collection.deleteOne({ _id: ObjectID(id) });
  if (result.deletedCount === 0) {
    return res.status(404).send('Ticket not found');
  }
  res.send('Ticket deleted successfully');
});

// Endpoint to update a ticket by ID
app.put('/rest/ticket/:id', async (req, res) => {
  const id = req.params.id;
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  const ticket = await collection.findOne({ _id: ObjectID(id) });
  if (!ticket) {
    return res.status(404).send('Ticket not found');
  }
  const updatedTicket = {
    _id: ObjectID(id),
    created_at: ticket.created_at,
    updated_at: new Date(),
    type: req.body.type || ticket.type,
    subject: req.body.subject || ticket.subject,
    description: req.body.description || ticket.description,
    