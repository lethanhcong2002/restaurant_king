const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController.cjs');

router.get('/getAdmins', accountController.getAllAdmins);
router.put('/change-pass/:id', accountController.changePassword)
router.post('/login', accountController.loginAdmin);
router.post('/create-accounts', accountController.createAccounts);
router.put('/update-account/:id', accountController.updateAccount);
router.put('/reset-account/:id', accountController.resetAccount);

module.exports = router;
