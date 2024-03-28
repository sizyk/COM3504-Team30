const express = require('express');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();
const plants = require('../controllers/plants');

/* GET home page. */
router.get('/', (req, res) => {
  const result = plants.get({});
  result.then((allPlants) => {
    const data = {
      title: 'All Plants',
      plants: allPlants || [],
      scripts: ['filters', 'plantForm'],
    };

    renderLayout(res, 'index', data);
  });
});

// Fix 404 when refreshing page after submitting plant form
router.post('/', (req, res) => {
  res.redirect('/');
});

module.exports = router;
