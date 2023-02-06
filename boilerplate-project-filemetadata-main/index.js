let express = require('express');
let cors = require('cors');
let multer = require('multer');
let fs = require('fs');

let app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.urlencoded({extended:true}));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let fsUnlinkAsync = function (path) {
  return new Promise(function (resolve, reject) {
    fs.unlink(path, function (error) { reject(error) });
    resolve(`${path} deleted.`);
  });
};
let upload = multer({dest: 'public/', limits: {fileSize: 134217728, files: 1, parts: 2}})
app.post('/api/fileanalyse', upload.single('upfile'), function (req, res) {
  let {originalname: name, mimetype: type, size} = req.file;
  fsUnlinkAsync(req.file.path).then(function (result) {
    console.log(result);
    res.json({name, type, size});
  }).catch(function (error) {
    res.json({error});
  });
});

app.use('/api/fileanalyse', function (err, req, res, next) {
  res.json(err);
});

let port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
