// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/:date?", function (req, res) {
  let errReturn = {error: 'Invalid Date'};
  let date;
  if (req.params.date) {
    if (req.params.date.match(/^\d+$/)) {
      date = new Date(parseInt(req.params.date));
      if (date.toString() === 'Invalid Date') {
        res.json(errReturn);
      } else {
        res.json({unix: date.getTime(), utc: `${date.toUTCString()}`});
      };
    } else if (req.params.date.match(/^[0-9a-z,\ \-]+$/i)) {
      date = new Date(req.params.date);
      if (date.toString() === 'Invalid Date') {
        res.json(errReturn);
      } else {
        res.json({unix: date.getTime(), utc: `${date.toUTCString()}`});
      };
    } else {
      res.json(errReturn);
    };
  } else {
    res.json({unix: Date.now(), utc: `${(new Date()).toUTCString()}`});
  };
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
