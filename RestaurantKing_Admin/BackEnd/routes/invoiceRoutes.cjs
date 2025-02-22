// invoiceRoutes.js
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController.cjs');

router.post('/addInvoice', invoiceController.addInvoice);
router.get('/getInvoices', invoiceController.getInvoices);
router.put('/invoice/:id', invoiceController.updateInvoiceStatus);
router.put('/payment/:id', invoiceController.processPayment);
router.get('/invoice_dashboard', invoiceController.getInvoiceDashboard);
router.get('/invoice_home', invoiceController.getInvoiceHome);

module.exports = router;
