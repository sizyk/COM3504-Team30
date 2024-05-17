const express = require('express');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const data = {
    title: 'All Plants',
    plants: [], // Will be fetched locally, to make loading faster
    scripts: ['sortPlants', 'filters', 'plantForm', 'mapDriver', 'locationPicker'],
    useLeaflet: true,
    dataset: {
      centre: [0, 0],
      plants: [],
    },
  };

  renderLayout(res, 'index', data);
});

// Fix 404 when refreshing page after submitting plant form
router.post('/', (req, res) => {
  res.redirect('/');
});

module.exports = router;
