const express = require('express');
// const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');
const { getPlantById } = require('../controllers/plants');

const router = express.Router();

router.get('/:id', (req, res) => {
  const result = getPlantById(req.params.id);
  result.then(JSON.parse).then((plants) => {
    plants.forEach((p) => {
      const dt = new Date(p.dateTimeSeen);
      let day = dt.getDate().toString(); // Days are 1-indexed
      day = day > 9 ? day : `0${day}`;

      let month = (dt.getMonth() + 1).toString(); // Months are 0-indexed (consistency!)
      month = month > 9 ? month : `0${month}`;

      const year = dt.getFullYear();

      let hour = dt.getHours().toString();
      hour = hour > 9 ? hour : `0${hour}`;

      let min = dt.getMinutes().toString();
      min = min > 9 ? min : `0${min}`;

      const tz = dt.getTimezoneOffset();

      p.spottedString = `Spotted at ${hour}:${min} on ${day}/${month}/${year} in Sheffield `;

      p.emoji = '🇬🇧';
    });
    // Returns a list, so get the first item
    const plant = plants[0];
    renderLayout(res, 'plant', { title: 'Individual Plant', plant });
  }).catch((error) => console.log(error));
});

module.exports = router;
