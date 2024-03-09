const express = require('express');
const multer = require('multer');
const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();
const plants = require('../controllers/plants');

/* IMAGE CODE (move into seperate route eventually) */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/img/uploads');
  },
  filename(req, file, cb) {
    const original = file.originalname;
    const fileExtension = original.split('.');
    const filename = `${Date.now()}.${fileExtension[fileExtension.length - 1]}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

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
  const result = plants.getAll();
  result.then((students) => {
    const data = JSON.parse(students);
    log(data.length);
    renderLayout(res, 'form_test', { title: 'Form Test', data });
  });
});

router.post('/form-test', upload.single('image'), (req, res) => {
  const plantData = req.body;
  const filepath = req.file.path;
  let hasFlowers;
  let hasLeaves;
  let hasFruit;
  let hasSeeds;

  // deal with checkboxes, as they have no value if not checked
  if (plantData.hasFlowers === 'true') {
    hasFlowers = true;
  } else {
    hasFlowers = false;
  }
  if (plantData.hasLeaves === 'true') {
    hasLeaves = true;
  } else {
    hasLeaves = false;
  }

  if (plantData.hasFruit === 'true') {
    hasFruit = true;
  } else {
    hasFruit = false;
  }

  if (plantData.hasSeeds === 'true') {
    hasSeeds = true;
  } else {
    hasSeeds = false;
  }

  const plant = {
    author: 'placeholder', // replace with user when implemented
    name: plantData.name,
    description: plantData.description,
    dateTimeSeen: new Date(plantData.dateTimeSeen),
    size: parseFloat(plantData.size),
    sunExposure: plantData.sunExposure,
    colour: plantData.colour,
    longitude: 0,
    latitude: 0,
    image: filepath,
    hasFlowers,
    hasLeaves,
    hasFruit,
    hasSeeds,
  };

  let result = plants.create(plant);
  log(result);

  // render page with updated data
  result = plants.getAll();
  result.then((students) => {
    const data = JSON.parse(students);
    log(data.length);
    renderLayout(res, 'form_test', { title: 'Form Test', data });
  });
});

module.exports = router;
