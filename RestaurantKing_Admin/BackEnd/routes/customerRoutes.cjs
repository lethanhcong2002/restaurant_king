// customerRoutes.cjs
const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController.cjs');

router.get('/getCustomers', customerController.getCustomers);
router.put('/customer/:id', customerController.updateCustomerStatus);

module.exports = router;
