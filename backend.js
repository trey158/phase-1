const express = require('express');
const bodyParser=require('body-parser');
const app = express();
const port = 3000;
var fs = require("fs");

app.listen(port);
console.log('Server started at http://localhost:' + port);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes will go here

app.get('/', function(req, res) {
  const myquery = req.query;
  var outstring = 'Starting... ';
  res.send(outstring);
});


// Write to a file 

app.get('/wfile', function(req, res) {
  const myquery = req.query;
  
  var outstring = '';
  for(var key in myquery) { outstring += "--" + key + ">" + myquery[key]; }
  fs.appendFile("mydata.txt", outstring+'\n', (err) => {
    if (err)
      console.log(err);
    else {
      console.log("File written successfully\n");
      console.log("Contents of file now:\n");
      console.log(fs.readFileSync("mydata.txt", "utf8"));
    }
  });
 
  res.send(outstring);

});


// Simple cascade
app.param('name', function(req, res, next, name) {
  const modified = name.toUpperCase();

  req.name = modified;
  next();
});


// A POST request

app.post('/post/users', function(req, res) {
  const user_id = req.body.id;
  const token = req.body.token;
  const geo = req.body.geo;

  res.send({
    'user_id': user_id,
    'token': token,
    'geo': geo
  });
});

app.post('/rest/ticket', function(request, respond) {
  var body = '';
  filePath = __dirname + 'mydata.txt';
  request.on('data', function(data) {
      body += data;
  });

  request.on('end', function (){
      fs.appendFile(filePath, body, function() {
          respond.end();
      });
  });
});

app.get('rest/list/', function(req, res) {
  const id = req.query.id;
  const created_at = req.query.created_at;
  const updated_at = req.query.updated_at;
  const type = req.query.type;
  const subject = req.query.subject;
  const description = req.query.description;
  const priority = req.query.priority;
  const status = req.query.status;
  const recipient = req.query.recipient;
  const submitter = req.query.submitter;
  const assignee_id = req.query.assignee_id;
  const follower_ids = req.query.follower_ids;
  const tags = req.query.tags;
  res.send({
    'id': id,
    'created_at': created_at,
    'updated_at': updated_at,
    'type': type,
    'subject': subject,
    'description': description,
    'priority': priority,
    'status': status,
    'recipient': recipient,
    'submitter': submitter,
    'assignee_id': assignee_id,
    'follower_ids': follower_ids,
    'tags': tags
  });
});

app.get('/users', function(req, res) {
  const user_id = req.query.id;
  const Fname = req.query.Fname;
  const Lname = req.query.Lname;
  res.send({
    'user_id': user_id,
    'Fname': Fname,
    'Lname': Lname
  });
});
