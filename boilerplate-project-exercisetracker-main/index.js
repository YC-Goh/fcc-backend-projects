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

app.get('/api/users', function (req, res) {
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
  if (_id.match(/^[0-9a-z_]+$/)) {
    next();
  } else {
    res.json({error: 'Invalid ID Format'});
  };
});

app.get('/api/users/:_id/logs', function (req, res, next) {
  let {_id} = req.params;
  userModel.findById(_id).then(function (data) {
    req.query._id = data._id;
    req.query.username = data.username;
    next();
  }).catch(function (err) {
    res.json(err);
  });
});

app.get('/api/users/:_id/logs', function (req, res, next) {
  let {from} = req.query;
  if (from) {
    if (from.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
      from = new Date(from);
      if (from.toString() === 'Invalid Date') {
        res.json({error: 'Invalid Date'});
      } else {
        req.query.from = from.toISOString().slice(0,10);
        console.log(req.query);
        next();
      };
    } else {
      res.json({error: 'from field has invalid date format'})
    };
  } else {
    req.query.from = (new Date(0)).toISOString().slice(0,10);
    console.log(req.query);
    next();
  };
});

app.get('/api/users/:_id/logs', function (req, res, next) {
  let {to} = req.query;
  if (to) {
    if (to.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
      to = new Date(to);
      if (to.toString() === 'Invalid Date') {
        res.json({error: 'Invalid Date'});
      } else {
        req.query.to = to.toISOString().slice(0,10);
        console.log(req.query);
        next();
      };
    } else {
      res.json({error: 'to field has invalid date format'})
    };
  } else {
    req.query.to = (new Date()).toISOString().slice(0,10);
    console.log(req.query);
    next();
  };
});

app.get('/api/users/:_id/logs', function (req, res, next) {
  let {limit} = req.query;
  if (limit) {
    if (limit.match(/^[0-9]+$/i) && limit !== '0') {
      req.query.limit = parseInt(limit);
      next();
    } else {
      res.json({error: 'Invalid limit'});
    };
  } else {
    next();
  }
});

app.get('/api/users/:_id/logs', function (req, res) {
  console.log(req.query);
  let {from, to, limit, _id, username} = req.query;
  let SELECT = {date: 1, duration: 1, description: 1};
  let FIND = {username};
  let findHandler = function (err, log) {
    if (err) {
      res.json(err);
    } else {
      res.json({username, count: log.length, _id, log});
    };
  };
  if (limit) {
    exerciseModel.find(FIND).select(SELECT).where('date').gte(from).lte(to).limit(limit).exec(findHandler);
  } else {
    exerciseModel.find(FIND).select(SELECT).where('date').gte(from).lte(to).exec(findHandler);
  };
});
