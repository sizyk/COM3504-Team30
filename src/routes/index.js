const express = require('express');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();

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
  renderLayout(res, 'form_test', { title: 'Form Test' });
});

router.post('/form-test', (req, res) => {
  plant = {
    name: req.body.name,
    description: req.body.description,
    dateTimeSeen: new Date(req.body.dateTimeSeen),
    size: parseFloat(req.body.size),
    sunExposure: req.body.sunExposure,
    colour: req.body.colour}

  if (req.body.hasFlowers === 'true') {
    plant.hasFlowers = true
  }else{
    plant.hasFlowers = false
  }
  if (req.body.hasLeaves === 'true') {
    plant.hasLeaves = true
  }else{
    plant.hasLeaves = false
  }

  if (req.body.hasFruit === 'true') {
    plant.hasFruit = true
  }else{
    plant.hasFruit = false
  }

  if (req.body.hasSeeds === 'true') {
    plant.hasSeeds = true
  }else{
    plant.hasSeeds = false
  }

  console.log(plant);
  renderLayout(res, 'form_test', { title: 'Form Test' });
});

module.exports = router;
