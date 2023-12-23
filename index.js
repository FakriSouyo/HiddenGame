const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use("/img", express.static("img"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

let scores = {};

// Route for downloading the password.py file
app.get('/download', isAuthenticated, (req, res) => {
  const filePath = path.join(__dirname, 'public', 'password.py');

  // Check if the file exists
  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) {
      // File not found or not readable
      return res.status(404).send('File not found.');
    }

    // Set appropriate headers for file download
    res.setHeader('Content-disposition', 'attachment; filename=password.py');
    res.setHeader('Content-type', 'text/plain');

    // Create a read stream and pipe it to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

app.use(express.static('public', {
  extensions: ["html", "htm", "gif", "png"]
}));

app.get('/getout', isAuthenticated, (req, res) => {
  const username = req.session.username || 'anonymous';
  const flagFound = scores[username] ? scores[username].flagFound : false;

  if (!flagFound) {
    scores[username] = { flagFound: true, score: (scores[username] ? scores[username].score : 0) + 10 };
  }

  res.sendFile(path.join(__dirname, 'public', 'getout', 'index.html'));
});

app.get('/score', isAuthenticated, (req, res) => {
  res.json(scores);
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  req.session.username = username;
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

function isAuthenticated(req, res, next) {
  if (req.session && req.session.username) {
    return next();
  } else {
    return res.redirect('/');
  }
}
