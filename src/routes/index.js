const express = require('express');
const log = require('debug')('app:db');
const upload = require('../helpers/upload-image');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();
const plants = require('../controllers/plants');

let flashData = { message: null, type: 'info' };

/* GET home page. */
router.get('/', (req, res) => {
  const result = plants.get({});
  result.then((allPlants) => {
    const data = {
      title: 'All Plants',
      plants: allPlants || [],
      scripts: ['filters', 'plantForm'],
    };
    if (flashData.message !== null) {
      data.flash = flashData;
    }
    renderLayout(res, 'index', data);
    flashData.message = null;
  });
});

// Fix 404 when refreshing page after submitting plant form
router.post('/', (req, res) => {
  res.redirect('/');
});

router.post('/create-plant', upload.single('image'), (req, res) => {
  // set up the filepaths as either a file upload or the url
  let filepath;
  if (req.body.imageInput === 'url') {
    filepath = req.body.url;
  } else {
    filepath = `/${req.file.path.replace(/\\/g, '/')}`;
  }

  // Create the plant in the database
  plants.create(req.body, filepath)
    .then((result) => {
      log(result);
      flashData = { message: 'Plant created successfully!', type: 'success', icon: 'check_circle' };
    })
    .catch((error) => {
      log(error);
      flashData = { message: 'Error occurred whilst creating new plant!', type: 'error', icon: 'error' };
    });
  res.redirect('/');
});

router.post('/edit-plant', upload.single('image'), async (req, res) => {
  // check what type of image input is being used
  let filepath;
  if (req.body.imageInput === 'url' && req.body.url !== '') {
    filepath = req.body.url;
  } else if (req.file) {
    filepath = `/${req.file.path.replace(/\\/g, '/')}`;
  } else { // no new image then use current image
    filepath = req.body.currentImage;
  }

  // Update the plant in the database
  plants.update(req.body, filepath)
    .then((result) => {
      log(result);
      flashData = { message: 'Plant updated successfully!', type: 'success', icon: 'check_circle' };
    })
    .catch((error) => {
      log(error);
      flashData = { message: 'Error occurred whilst updating plant!', type: 'error' };
    });
  res.redirect('/');
});

router.post('/delete-plant', upload.single('image'), async (req, res) => {
  // Delete the plant from the database
  plants.delete(req.body.id)
    .then((result) => {
      log(result);
      flashData = { message: 'Plant deleted successfully!', type: 'success', icon: 'check_circle' };
    })
    .catch((error) => {
      log(error);
      flashData = { message: 'Error occurred whilst deleting plant!', type: 'error', icon: 'error' };
    });
  res.redirect('/');
});

module.exports = router;
