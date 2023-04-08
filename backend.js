const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const ticketsFile = './tickets.json';

// Endpoint to get all tickets
app.get('/rest/list', (req, res) => {
  const tickets = JSON.parse(fs.readFileSync(ticketsFile));
  res.send(tickets);
});

// Endpoint to get a single ticket by ID
app.get('/rest/ticket/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send('Invalid ID');
  }
  
  const tickets = JSON.parse(fs.readFileSync(ticketsFile));
  const ticket = tickets.find((t) => t.id === parseInt(req.params.id));
  if (!ticket) {
    return res.status(404).send('Ticket not found');
  }
  
  res.send(ticket);
});

// Endpoint to create a new ticket
app.post('/rest/ticket', (req, res) => {
  const tickets = JSON.parse(fs.readFileSync(ticketsFile));
  const newTicket = {
    id: uuidv4(),
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
  tickets.push(newTicket);
  fs.writeFileSync(ticketsFile, JSON.stringify(tickets, null, 2));
  res.send(newTicket);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});