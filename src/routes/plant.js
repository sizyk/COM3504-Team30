const express = require('express');
// const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');
const { getPlants } = require('../controllers/plants');
const { getChat } = require('../controllers/chat');

const router = express.Router();

router.get('/:id', (req, res) => {
  const result = getPlants({ _id: req.params.id });
  const chats = getChat({ plant: req.params.id });
  console.log(chats);
  result.then((plants) => {
    const plant = plants[0];
    renderLayout(res, 'plant', {
      title: 'Individual Plant', plant, chats, scripts: ['chat'],
    });
  });
});

module.exports = router;
