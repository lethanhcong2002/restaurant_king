// supplierRoutes.js
const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController.cjs');

router.post('/addSupplier', supplierController.addSupplier);
router.get('/getSuppliers', supplierController.getSuppliers);
router.get('/supplier/:id', supplierController.getSupplierById);
router.put('/supplier/:id', supplierController.updateSupplier);
router.delete('/supplier/:id', supplierController.deleteSupplier);

module.exports = router;
