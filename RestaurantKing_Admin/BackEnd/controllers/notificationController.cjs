// notificationController.cjs
const { db } = require('../firebaseConfig.cjs');
const { sendNotificationToCustomer } = require('../utils.cjs');

const updateOrderStatus = async (req, res) => {
    const { orderId, userId } = req.params;
    const { status } = req.body;

    if (!orderId || !userId || !status) {
        return res.status(400).send('Thiếu thông tin cần thiết: orderId, userId, status.');
    }

    try {
        const notificationData = {
            orderId: orderId,
            type: 'order_status',
            status: status
        };

        const title = `Cập nhật đơn hàng #${orderId}`;
        const body = `Trạng thái đơn hàng của bạn đã thay đổi thành: ${status}.`;

        await sendNotificationToCustomer(userId, title, body, notificationData);

        res.status(200).send('Thông báo đã được gửi thành công!');
    } catch (error) {
        res.status(500).send('Lỗi khi gửi thông báo: ' + error.message);
    }
};

const createNotification = async (req, res) => {
    const { notification } = req.body;

    const data = {
        title: notification.title,
        message: notification.message,
        description: notification.description,
        recipient: notification.recipient,
        createdAt: new Date().toISOString(),
    }

    try {
        const invoiceRef = await db.collection('notification').add(data);
        res.status(200).send({ success: true, id: invoiceRef.id });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
};

const getNotifications = async (req, res) => {
    try {
        const invoicesSnapshot = await db.collection('notification').get();

        if (invoicesSnapshot.empty) {
            return res.status(200).json([]);
        }

        const notifi = invoicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        notifi.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);

            return dateB - dateA;
        });

        res.status(200).json(notifi);

    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).send('Internal Server Error');
    }
};

const updateNotification = async (req, res) => {
    const notificationId = req.params.id;
    const { notification } = req.body;

    const data = {
        title: notification.title,
        message: notification.message,
        description: notification.description,
        recipient: notification.recipient,
        updatedAt: new Date().toISOString(),
    };

    try {
        const notificationRef = db.collection('notification').doc(notificationId);

        const doc = await notificationRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notificationRef.update(data);

        res.status(200).json({ success: true, message: 'Notification updated successfully' });
    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const deleteNotification = async (req, res) => {
    const notificationId = req.params.id;

    try {
        const notificationRef = db.collection('notification').doc(notificationId);

        const doc = await notificationRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notificationRef.delete();

        res.status(200).json({ message: 'Notification deleted successfully' });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).send('Internal Server Error');
    }
};

const sendNotificationToUser = async (req, res) => {
    const { userId } = req.params;
    const { title, body, notificationData } = req.body;

    if (!userId || !title || !body) {
        return res.status(400).json({ message: 'Thiếu thông tin cần thiết (userId, title, body).' });
    }

    try {
        await sendNotificationToCustomer(userId, title, body, notificationData);
        res.status(200).json({ message: 'Thông báo đã được gửi thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi gửi thông báo.', error: error.message });
    }
};

const sendNotificationToAllUsers = async (req, res) => {
    const { title, body, notificationData } = req.body;

    if (!title || !body || !notificationData) {
        return res.status(400).json({ message: 'Thiếu thông tin cần thiết (title, body, notificationData).' });
    }

    try {
        const customersSnapshot = await db.collection('customers').get();

        if (customersSnapshot.empty) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng nào.' });
        }

        const customerIds = customersSnapshot.docs.map(doc => doc.id);

        const sendPromises = customerIds.map(async (customerId) => {

            await sendNotificationToCustomer(customerId, title, body, notificationData);
        });

        await Promise.all(sendPromises);

        res.status(200).json({ message: 'Thông báo đã được gửi đến tất cả khách hàng.' });
    } catch (error) {
        console.error('Lỗi khi gửi thông báo:', error);
        res.status(500).json({ message: 'Lỗi khi gửi thông báo.', error: error.message });
    }
};

module.exports = {
    updateOrderStatus,
    createNotification,
    getNotifications,
    updateNotification,
    deleteNotification,
    sendNotificationToUser,
    sendNotificationToAllUsers,
};
