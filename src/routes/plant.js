const express = require('express');
// const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');
const { getPlants } = require('../controllers/plants');

const router = express.Router();

router.get('/:id', (req, res) => {
  const result = getPlants({ _id: req.params.id });
  result.then((plants) => {
    const plant = plants[0];
    renderLayout(res, 'plant', { title: 'Individual Plant', plant });
  });
});

module.exports = router;
