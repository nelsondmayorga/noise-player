const express = require('express');
const path = require('path');
const forceSsl = require('force-ssl-heroku');

const app = express();

// Redirect to https
app.use(forceSsl);

// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/noise-player'));



// PathLocationStrategy
app.get('/*', function(req,res) {
  res.sendFile(path.join(__dirname+'/dist/noise-player/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
