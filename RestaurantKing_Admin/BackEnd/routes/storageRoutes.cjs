// storageRoutes.cjs
const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController.cjs');

router.post('/addStorage', storageController.addStorage);
router.get('/getStorage', storageController.getStorage);
router.put('/updateStorageStatus/:id', storageController.updateStorageStatus);
router.get('/storage/:id', storageController.getStorageById);
router.put('/storage/:id', storageController.updateStorage);
router.get('/getStorageBySupplier/:id', storageController.getStorageBySupplier);

module.exports = router;
