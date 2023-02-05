require('dotenv').config();
let express = require('express');
let cors = require('cors');
let app = express();
let mongoose = require('mongoose');
let dns = require('dns');

// Basic Configuration
let port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI);

// The URL template (Schematic, Model, Whatever)
let urlScheme = mongoose.Schema({
  root: {type: String, required: true, unique: true}, 
  id: {type: Number, required: true, unique: true}
});

let urlModel = mongoose.model('originalUrl', urlScheme);

// Constants
let URLPATTERN = /^https?:\/\/([a-z0-9]+(\.[a-z0-9\-]+)+)\/?$/i
let INVALIDURLERROR = {error: 'invalid url'};

app.use(cors());
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/:shorturl', function(req, res) {
  let shortUrl = req.params.shorturl;
  urlModel.findOne({id: shortUrl}).then(function (data) {
    res.redirect(data.root);
  }).catch(function (err) {
    res.json({error: 'No such short URL in the database'});
  })
});

app.post('/api/shorturl', function(req, res, next) {
  if (req.body.url && req.body.url.match(URLPATTERN)) {
    req.body.hostname = req.body.url.replace(URLPATTERN, '$1');
    dns.lookup(req.body.hostname, function (err, add, ipv) { 
      if (add) { 
        next();
      } else {
        next(`DNS failed for host name ${req.body.hostname}.`);
      };
    });
  } else {
    next(`${req.body.hostname} is not a recognised URL format.`);
  };
});

app.post('/api/shorturl', function(req, res, next) {
  urlModel.findOne({root: req.body.url}).then(function (data) {
    res.json({original_url: data.root, short_url: data.id});
  }).catch(function (err) {
    next();
  });
});

app.post('/api/shorturl', async function(req, res, next) {
  let count = await urlModel.countDocuments({});
  urlModel.create({root: req.body.url, id: count}).then(function (data) {
    res.json({original_url: data.root, short_url: data.id});
  }).catch(function (err) {
    next(`Could not create new database document for URL ${req.body.url}.`);
  });
});

app.post('/api/shorturl', function(err, req, res, next) {
  console.log(err.stack);
  res.json(INVALIDURLERROR);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
