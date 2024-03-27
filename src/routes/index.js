const express = require('express');
const multer = require('multer');
const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();
const plants = require('../controllers/plants');

let flashData = { message: null, type: 'info' };

/* IMAGE CODE (move into seperate route eventually) */

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/img/uploads');
  },
  filename(req, file, cb) {
    const original = file.originalname;
    const fileExtension = original.split('.');
    const filename = `${Date.now()}.${fileExtension[fileExtension.length - 1]}`;
    cb(null, filename);
  },
});
const upload = multer({ storage });

/* GET home page. */
router.get('/', (req, res) => {
  const result = plants.getPlants({});
  result.then((allPlants) => {
    const data = {
      title: 'All Plants',
      plants: allPlants,
      scripts: ['filters'],
    };
    if (flashData.message !== null) {
      data.flash = flashData;
    }
    renderLayout(res, 'index', data);
    flashData.message = null;
  });
});

router.post('/create-plant', upload.single('image'), (req, res) => {
  // Create the plant in the database
  plants.create(req.body, req.file)
    .then((result) => {
      log(result);
      flashData = { message: 'Plant created successfully', type: 'success' };
    })
    .catch((error) => {
      log(error);
      flashData = { message: 'Error occurred whilst creating new plant', type: 'error' };
    });
  res.redirect('/');
});

router.post('/edit-plant', upload.single('image'), async (req, res) => {
  // Update the plant in the database
  plants.update(req.body, req.file)
    .then((result) => {
      log(result);
      flashData = { message: 'Plant updated successfully', type: 'success' };
    })
    .catch((error) => {
      log(error);
      flashData = { message: 'Error occurred whilst updating plant', type: 'error' };
    });
  res.redirect('/');
});

router.post('/delete-plant', upload.single('image'), async (req, res) => {
  // Delete the plant from the database
  plants.delete(req.body.id)
    .then((result) => {
      log(result);
      flashData = { message: 'Plant deleted successfully', type: 'success' };
    })
    .catch((error) => {
      log(error);
      flashData = { message: 'Error occurred whilst deleting plant', type: 'error' };
    });
  res.redirect('/');
});

module.exports = router;
