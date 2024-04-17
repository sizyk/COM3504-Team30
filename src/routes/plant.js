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
      title: 'Individual Plant',
      plant,
      scripts: ['mapDriver', 'plantForm', 'chat'],
      useLeaflet: true,
      dataset: {
        centre: [plant.latitude, plant.longitude],
        plants: [{
          _id: plant._id,
          image: plant.image,
          coordinates: [plant.latitude, plant.longitude],
        }],
      },
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
