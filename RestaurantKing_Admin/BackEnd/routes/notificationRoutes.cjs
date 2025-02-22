const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController.cjs');

router.post('/order/status/:orderId/:userId', notificationController.updateOrderStatus);
router.post('/new-notification', notificationController.createNotification);
router.get('/getNotification', notificationController.getNotifications);
router.put('/notification/:id', notificationController.updateNotification);
router.delete('/notification/:id', notificationController.deleteNotification);
router.post('/send-notification-to/:userId', notificationController.sendNotificationToUser);
router.post('/send-notification-to-all', notificationController.sendNotificationToAllUsers);

module.exports = router;
