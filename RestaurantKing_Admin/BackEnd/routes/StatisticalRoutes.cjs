const express = require('express');
const router = express.Router();
const statisticalController = require('../controllers/StatisticalController.cjs');

router.get('/popular-time-slots', statisticalController.getPopularTimeSlots);
router.get('/top-10-products', statisticalController.getTop10ItemsFromInvoices);

module.exports = router;
