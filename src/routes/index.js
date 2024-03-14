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
  const result = plants.getAll();
  result.then((allPlants) => {
    renderLayout(res, 'index', { title: 'All Plants', plants: allPlants, scripts: ['filters'] });
  });
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

router.get('/chat', (req, res) => {
  renderLayout(res, 'chat', { scripts: ['chat'] });
});

module.exports = router;
