const express = require('express');
// const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');
const { get } = require('../controllers/plants');

const router = express.Router();

router.get('/:id', (req, res) => {
  const result = get({ _id: req.params.id });
  result.then((plants) => {
    const plant = plants[0];
    renderLayout(res, 'plant', { title: 'Individual Plant', plant, scripts: ['plantForm'] });
  });
});

module.exports = router;
