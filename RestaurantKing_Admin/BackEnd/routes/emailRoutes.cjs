const express = require('express');
const router = express.Router();
const {
    sendEmailController,
    sendEmailToEmployeesController
} = require('../controllers/emailController.cjs');

router.post('/send-email', sendEmailController);

router.post('/send-email-to-employees', sendEmailToEmployeesController);

module.exports = router;
