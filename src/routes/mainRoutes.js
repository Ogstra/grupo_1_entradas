const express = require('express');
const router = express.Router();

const mainController = require('../controllers/mainController.js');

router.get('/', mainController.getIndex);

router.get('/cart', mainController.getCart);

module.exports = router;