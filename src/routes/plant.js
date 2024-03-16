const express = require('express');
// const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');

const { get } = require('../controllers/plants');

const router = express.Router();

router.get('/:id', (req, res) => {
  const result = get({ _id: req.params.id });
  result.then((plants) => {
    const plant = plants[0];
    renderLayout(res, 'plant', {
<<<<<<< HEAD
      title: 'Individual Plant', plant, scripts: ['plantForm', 'chat'],
=======
      title: 'Individual Plant',
      plant,
      scripts: ['map-test'],
      useLeaflet: true,
      dataset: {
        plant: {
          coordinates: [plant.latitude, plant.longitude],
        },
      },
>>>>>>> 05a5084 (Added leaflet)
    });
  });
});

/**
 * Simply renders a single card for a given plant (used for live updates)
 */
router.post('/card', (req, res) => {
  const plant = req.body;
  plant.dateTimeSeen = new Date(plant.dateTimeSeen);
  res.render('card-only', { plant });
});

module.exports = router;
