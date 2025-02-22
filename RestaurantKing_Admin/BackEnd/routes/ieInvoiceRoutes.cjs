const express = require('express');
const {
    addInvoiceImport,
    updateInvoiceIE,
    getInvoicesIE,
    deleteInvoiceIE,
    addInvoiceExport,
    refundInvoice
} = require('../controllers/ieInvoiceController.cjs');

const router = express.Router();

router.post('/addInvoiceImport', addInvoiceImport);
router.put('/updateInvoiceIE/:id', updateInvoiceIE);
router.get('/invoicesIE', getInvoicesIE);
router.put('/refund/:id', refundInvoice)
router.delete('/deleteInvoiceIE/:id', deleteInvoiceIE);
router.post('/addInvoiceExport', addInvoiceExport);

module.exports = router;
