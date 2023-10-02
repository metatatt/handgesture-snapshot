import express from 'express';
const app = express();

import http from 'http';
const server = http.Server(app);


import bodyParser from 'body-parser';

// Middleware
app.use(bodyParser.json());



// Express routing path variable: __dirname, __filename
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files from the 'public' directory
app.use(express.static(__dirname + '/public'));


// Route for Operator- camera.html
app.get('/', function (req, res) {
  res.sendFile('camera.html', { root: __dirname + '/public' });
});

// Route for Supervisor-Lead - console.html file
app.get('/lead', function (req, res) {
  res.sendFile('console.html', { root: __dirname + '/public' });
});


const port = process.env.PORT || 3000;
server.listen(port, function () { // Updated this line to use 'server' instead of 'http'
  console.log(`Server listening on port ${port}`);
});
