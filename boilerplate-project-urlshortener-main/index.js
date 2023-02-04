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

app.post('/api/shorturl', function(req, res) {
  let originalUrl = req.body.url;
  let invalidUrlErr = {error: 'invalid url'};
  if (originalUrl) {
    let urlPattern = /^https?:\/\/([a-z0-9]+(\.[a-z0-9\-]+)+)\/?$/i
    if (originalUrl.match(urlPattern)) {
      let originalHostName = originalUrl.replace(urlPattern, '$1');
      dns.lookup(originalHostName, function (err, add, ipv) {
        if (err) {
          res.json(invalidUrlErr);
        } else {
          urlModel.findOne({root: originalUrl}).then(function (data) {
            res.json({original_url: data.root, short_url: data.id});
          }).catch((err) => {
            urlModel.countDocuments({}).then(function (count) {
              urlModel.create({root: originalUrl, id: count}).then(function(data) {
                res.json({original_url: data.root, short_url: data.id});
              }).catch(function(err) {
                res.json(invalidUrlErr)
              })
            }).catch(function (err) {
              res.json(invalidUrlErr);
            });
          });
        };
      });
    } else {
      res.json(invalidUrlErr);
    };
  };
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
