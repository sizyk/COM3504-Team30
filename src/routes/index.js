const express = require('express');
const multer = require('multer');
const log = require('debug')('app:db');
const renderLayout = require('../helpers/layout-renderer');

const router = express.Router();
const plants = require('../controllers/plants');

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
    renderLayout(res, 'index', { title: 'All Plants', plants: allPlants, scripts: ['filters'] });
  });
});

router.get('/page-2', (req, res) => {
  renderLayout(res, 'page2');
});

router.get('/page-3', (req, res) => {
  renderLayout(res, 'page3');
});

router.post('/create-plant', upload.single('image'), (req, res) => {
  // Create the plant in the database
  const result = plants.create(req.body, req.file);
  log(result);

  // Redirect back to root upon success
  res.redirect('/');
});

router.post('/edit-plant', upload.single('image'), async (req, res) => {
  // Update the plant in the database
  const result = plants.update(req.body, req.file);
  log(result);

  // Redirect back to root upon success
  res.redirect('/');
});

router.post('/delete-plant', upload.single('image'), async (req, res) => {
  // Delete the plant from the database
  const result = plants.delete(req.body.id);
  log(result);

  // Redirect back to root upon success
  res.redirect('/');
});

module.exports = router;
