const express = require('express');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();
const plants = require('../controllers/plants');

/* GET home page. */
router.get('/', (req, res) => {
  const result = plants.get({});
  result.then((allPlants) => {
    const plantCoords = [];

    allPlants.forEach((plant) => {
      plantCoords.push({
        _id: plant._id,
        coordinates: [plant.latitude, plant.longitude],
        image: plant.image,
      });
    });

    const data = {
      title: 'All Plants',
      plants: allPlants || [],
      scripts: ['filters', 'plantForm', 'ejs.min', 'mapDriver', 'locationPicker'],
      useLeaflet: true,
      dataset: {
        centre: [0, 0],
        plants: plantCoords,
      },
    };

    renderLayout(res, 'index', data);
  });
});

// Fix 404 when refreshing page after submitting plant form
router.post('/', (req, res) => {
  res.redirect('/');
});

module.exports = router;
