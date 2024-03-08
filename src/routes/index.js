const express = require('express');
const renderLayout = require('../helpers/layout-renderer');
const router = express.Router();

const plants = require('../controllers/plants');

/* IMAGE CODE (move into seperate route eventually) */
var multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/uploads')
  },
  filename: function (req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split('.');
    filename = Date.now() + '.' + file_extension[file_extension.length - 1];
    cb(null, filename)
  }
});
let upload = multer({ storage: storage });

/* GET home page. */
router.get('/', (req, res) => {
  renderLayout(res, 'index');
});

router.get('/page-2', (req, res) => {
  renderLayout(res, 'page2');
});

router.get('/page-3', (req, res) => {
  renderLayout(res, 'page3');
});

router.get('/form-test', (req, res) => {
  renderLayout(res, 'form_test', { title: 'Form Test' });
});

router.post('/form-test', upload.single('image'), (req, res) => {
  let plantData = req.body;
  let filepath = req.file.path;

  plant = {
    author: "placeholder", //replace with user when implemented
    name: plantData.name,
    description: plantData.description,
    dateTimeSeen: new Date(plantData.dateTimeSeen),
    size: parseFloat(plantData.size),
    sunExposure: plantData.sunExposure,
    colour: plantData.colour,
    longitude: 0,
    latitude: 0,
    image: filepath}

  if (req.body.hasFlowers === 'true') {
    plant.hasFlowers = true
  }else{
    plant.hasFlowers = false
  }
  if (req.body.hasLeaves === 'true') {
    plant.hasLeaves = true
  }else{
    plant.hasLeaves = false
  }

  if (req.body.hasFruit === 'true') {
    plant.hasFruit = true
  }else{
    plant.hasFruit = false
  }

  if (req.body.hasSeeds === 'true') {
    plant.hasSeeds = true
  }else{
    plant.hasSeeds = false
  }

  let result = plants.create(plant);
  console.log(result);
  renderLayout(res, 'form_test', { title: 'Form Test' });
});

module.exports = router;
