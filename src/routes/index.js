const express = require('express');
const multer = require('multer');
const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();
const plants = require('../controllers/plants');
const PlantModel = require('../models/plants');

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
  const result = plants.getPlants({});
  result.then((allPlants) => {
    renderLayout(res, 'index', { title: 'All Plants', plants: allPlants, scripts: ['filters'] });
  });
});

router.get('/page-2', (req, res) => {
  renderLayout(res, 'page2');
});

router.get('/page-3', (req, res) => {
  renderLayout(res, 'page3');
});

router.post('/create-plant', upload.single('image'), (req, res) => {
  const plantData = req.body;
  const filepath = req.file.path.replace(/\\/g, '/');

  const plant = {
    author: 'placeholder', // replace with user when implemented
    name: plantData.name,
    description: plantData.description,
    dateTimeSeen: new Date(plantData.dateTimeSeen),
    size: parseFloat(plantData.size),
    sunExposure: plantData.sunExposure,
    colour: plantData.colour,
    longitude: plantData.longitude,
    latitude: plantData.latitude,
    image: filepath,
    hasFlowers: plantData.hasFlowers === 'true', // Checkboxes have no value if not checked, so manually check whether they are true
    hasLeaves: plantData.hasLeaves === 'true',
    hasFruit: plantData.hasFruit === 'true',
    hasSeeds: plantData.hasSeeds === 'true',
  };

  const result = plants.create(plant);
  log(result);

  res.redirect('/');
});

router.post('/edit-plant', upload.single('image'), async (req, res) => {
  const plantData = req.body;

  const plant = { // Get data from the form
    author: 'placeholder', // replace with user when implemented
    name: plantData.name,
    description: plantData.description,
    dateTimeSeen: new Date(plantData.dateTimeSeen),
    size: parseFloat(plantData.size),
    sunExposure: plantData.sunExposure,
    colour: plantData.colour,
    longitude: plantData.longitude,
    latitude: plantData.latitude,
    hasFlowers: plantData.hasFlowers === 'true', // Checkboxes have no value if not checked, so manually check whether they are true
    hasLeaves: plantData.hasLeaves === 'true',
    hasFruit: plantData.hasFruit === 'true',
    hasSeeds: plantData.hasSeeds === 'true',
  };

  if (req.file) { // If a new image is uploaded, update the image path
    const filepath = req.file.path.replace(/\\/g, '/');
    plant.image = filepath;
  }

  // TODO delete the old image if a new one is uploaded

  // Update the plant in the database
  try {
    const updatedModel = await PlantModel.findByIdAndUpdate(plantData._id, plant, {new: true});
    // Redirect to some page or send a response indicating success
    res.redirect('/');
  } catch (error) {
    log(error)
  }
});

module.exports = router;
