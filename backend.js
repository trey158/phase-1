const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectID } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const xml2js = require('xml2js');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const uri = 'mongodb+srv://admin:CMPS415@cluster0.nttgrun.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const dbName = 'ticketDB';
const collectionName = 'tickets';

// Connect to the database
client.connect((err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log('Connected to MongoDB');
});

// Ticket adapter to convert JSON to XML
class TicketAdapter {
  static async toJSON(ticket) {
    return {
      _id: ticket._id,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      type: ticket.type,
      subject: ticket.subject,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
      recipient: ticket.recipient,
      submitter: ticket.submitter,
      assignee_id: ticket.assignee_id,
      follower_ids: ticket.follower_ids,
      tags: ticket.tags
    };
  }

  static async toXML(ticket) {
    const jsonTicket = await TicketAdapter.toJSON(ticket);
    const builder = new xml2js.Builder();
    return builder.buildObject(jsonTicket);
  }

  static async fromXML(xml) {
    const parser = new xml2js.Parser();
    const json = await parser.parseStringPromise(xml);
    return {
      _id: new ObjectID(),
      created_at: new Date(),
      updated_at: new Date(),
      type: json.ticket.type[0],
      subject: json.ticket.subject[0],
      description: json.ticket.description[0],
      priority: json.ticket.priority[0],
      status: json.ticket.status[0],
      recipient: json.ticket.recipient[0],
      submitter: json.ticket.submitter[0],
      assignee_id: json.ticket.assignee_id[0],
      follower_ids: json.ticket.follower_ids[0],
      tags: json.ticket.tags[0]
    };
  }
}

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
    priority: req.body.priority || ticket.priority,
    status: req.body.status || ticket.status,
    recipient: req.body.recipient || ticket.recipient,
    submitter: req.body.submitter || ticket.submitter,
    assignee_id: req.body.assignee_id || ticket.assignee_id,
    follower_ids: req.body.follower_ids || ticket.follower_ids,
    tags: req.body.tags || ticket.tags,
  };
  await collection.updateOne({ _id: ObjectID(id) }, { $set: updatedTicket });
  res.send(updatedTicket);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});