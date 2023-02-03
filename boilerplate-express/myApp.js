require('dotenv').config();
let bodyParser = require('body-parser');
let express = require('express');
let app = express();

console.log('Hello World');

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function (req, res) {
    res.sendFile( __dirname + '/views/index.html' );
});

app.get('/now', function (req, res, next) {
    req.time = new Date().toString();
    next();
}, function (req, res) {
    res.json({
        'time': req.time
    });
});

app.get('/:word/echo', function (req, res) {
    res.json({
        'echo': req.params.word
    })
})

app.route('/name').get(function (req, res) {
    res.json({
        'name': `${req.query.first} ${req.query.last}`
    })
}).post(function (req, res) {
    res.json({
        'name': `${req.body.first} ${req.body.last}`
    })
})

app.use(function(req, res, next) {
    console.log(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

app.use('/public', express.static(__dirname + '/public'));

app.get('/json', function (req, res) {
    if (process.env.MESSAGE_STYLE==='uppercase') {
        res.json({'message': 'HELLO JSON'})
    } else {
        res.json({'message': 'Hello json'})
    }
})
























 module.exports = app;
