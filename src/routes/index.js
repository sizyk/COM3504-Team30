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
  renderLayout(res, 'form_test', {title: 'Form Test'});
});

module.exports = router;
