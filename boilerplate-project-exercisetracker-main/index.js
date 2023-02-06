require('dotenv').config();
let express = require('express');
let app = express();
let cors = require('cors');
let mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

let user = new mongoose.Schema({
  username: {type: String, unique: true, index: true}
});

let exercise = new mongoose.Schema({
  username: {type: String, index: true, required: true},
  description: {type: String},
  duration: {type: Number, min: 1, max: 1440, required: true},
  date: {type: String, required: true}
});

let userModel = mongoose.model('User', user);

let exerciseModel = mongoose.model('Exercise', exercise);

app.use(cors());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

let listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

app.post('/api/users', async function (req, res, next) {
  let {username} = req.body;
  if (username.match(/^[0-9a-z\ \.\-]+&/i)) {
    next();
  } else {
    res.json({error: 'Only spaces, periods and dashes are allowed as special characters. Please remove all other special characters.'});
  };
});

app.post('/api/users', async function (req, res, next) {
  let {username} = req.body;
  let data = await userModel.findOne({username})
  if (data) {
    let {username, _id} = data;
    res.json({username, _id});
  } else {
    next();
  };
});

app.post('/api/users', function (req, res) {
  let {username} = req.body;
  userModel.create({username}).then(function (data) {
    let {username, _id} = data;
    res.json({username, _id});
  }).catch(function (err) {
    res.json(err);
  });
});

app.post('/api/users', function (req, res) {
  userModel.find({}).select({username: 1, _id: 1}).then(function (data) {
    res.json(data);
  }).catch(function (err) {
    res.json(err);
  });
});

app.post('/api/users/:_id/exercises', function (req, res, next) {
  let {_id} = req.params;
  if (_id.match(/^[0-9a-z_]+$/)) {
    next();
  } else {
    res.json({error: 'Invalid ID Format'});
  };
});

app.post('/api/users/:_id/exercises', function (req, res, next) {
  let {_id} = req.params;
  userModel.findById(_id).then(function (data) {
    req.body._id = data._id;
    req.body.username = data.username;
    next();
  }).catch(function (err) {
    res.json(err);
  });
})

app.post('/api/users/:_id/exercises', function (req, res, next) {
  let {date} = req.body;
  if (date) {
    if (date.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
      date = new Date(date);
      if (date.toString() === 'Invalid Date') {
        res.json({error: 'Invalid Date'});
      } else {
        req.body.date = date.toISOString().slice(0,10);
        next();
      };
    } else {
      res.json({error: 'Invalid Date Format'});
    };
  } else {
    req.body.date = (new Date()).toISOString().slice(0,10);
    next();
  };
})

app.post('/api/users/:_id/exercises', function (req, res) {
  let {description, duration, date, _id, username} = req.body;
  exerciseModel.create({username, description, duration, date}).then(function (data) {
    res.json({username: data.username, description: data.description, duration: data.duration, date: data.date, _id});
  }).catch(function (err) {
    res.json(err);
  });
});

app.get('/api/users/:_id/logs', function (req, res, next) {
  let {_id} = req.params;
  userModel.findById(_id).then(function (data) {
    req.body._id = data._id;
    req.body.username = data.username;
    next();
  }).catch(function (err) {
    res.json(err);
  });
});

app.get('/api/users/:_id/logs', function (req, res, next) {
  let {from} = req.body;
  if (from) {
    if (from.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
      from = (new Date(from)).toISOString().slice(0,10);
      if (from === 'Invalid Date') {
        res.json({error: 'Invalid Date'});
      } else {
        from = (new Date(from)).toISOString.slice(0,10);
        next();
      };
    } else {
      res.json({error: 'from field has invalid date format'})
    };
  } else {
    next();
  };
});



app.get('/api/users/:_id/logs', function (req, res) {
  let {from, to, limit, _id, username} = req.body;
});
