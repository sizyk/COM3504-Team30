/**
 * Router for API-related requests (getting stuff from DB)
 */

const Express = require('express');
const plantsController = require('../controllers/plants');

const router = Express.Router();

router.get('/get-plants', (req, res) => {
  plantsController.getPlants({})
    .then((plants) => res.status(200).json(plants));
});

module.exports = router;
