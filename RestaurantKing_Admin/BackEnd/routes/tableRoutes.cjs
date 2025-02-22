const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController.cjs');

router.post('/addTable', tableController.addRT);
router.put('/updateTable/:id', tableController.updateRT);
router.delete('/deleteTable/:id', tableController.deleteRT);
router.get('/getTable', tableController.getRT);
// router.get('/getRT/:id', tableController.getRTById);

module.exports = router;
