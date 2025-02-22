// customerController.cjs
const { db } = require('../firebaseConfig.cjs');

const getCustomers = async (req, res) => {
    try {
        const invoicesSnapshot = await db.collection('customers').get();

        if (invoicesSnapshot.empty) {
            return res.status(404).json({ message: 'No invoices found' });
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

const updateCustomerStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (typeof status !== 'boolean') {
        return res.status(400).json({ message: 'Status phải là một giá trị boolean (true hoặc false).' });
    }

    try {
        const customerRef = db.collection('customers').doc(id);

        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            return res.status(404).json({ message: 'Không tìm thấy khách hàng với ID này.' });
        }

        await customerRef.update({ status });

        res.status(200).json({ message: 'Cập nhật trạng thái khách hàng thành công.' });
    } catch (error) {
        console.error('Error updating customer status:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getCustomers,
    updateCustomerStatus,
};
