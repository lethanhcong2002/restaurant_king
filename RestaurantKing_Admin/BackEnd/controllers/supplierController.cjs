const { db } = require('../firebaseConfig.cjs');

const addSupplier = async (req, res) => {
    try {
        const { name, phone, email, address, taxCode, timeRefund } = req.body;

        if (!name || !phone || !email || !address || !taxCode) {
            return res.status(400).send({ message: 'Tất cả các trường là bắt buộc.' });
        }

        const supplierData = {
            name,
            phone,
            email,
            address,
            taxCode,
            timeRefund,
            status: true,
            createdAt: new Date().toISOString(),
        };

        const docRef = await db.collection('suppliers').add(supplierData);

        res.status(200).send({
            message: 'Nhà cung cấp đã được thêm thành công!',
            supplierId: docRef.id,
        });
    } catch (error) {
        console.error('Lỗi khi thêm nhà cung cấp:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const getSuppliers = async (req, res) => {
    try {
        const snapshot = await db.collection('suppliers').get();

        if (snapshot.empty) {
            return res.status(200).send([]);
        }

        const supplierPromises = snapshot.docs.map(async (doc) => {
            const supplierData = {
                id: doc.id,
                ...doc.data(),
            };

            const productsSnapshot = await db.collection('storage')
                .where('supplier', '==', doc.id)
                .get();

            const products = productsSnapshot.empty ? [] : productsSnapshot.docs.map(productDoc => ({
                id: productDoc.id,
                ...productDoc.data(),
            }));

            return {
                ...supplierData,
                products: products,
            };
        });

        const suppliersWithProducts = await Promise.all(supplierPromises);
        res.status(200).send(suppliersWithProducts);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhà cung cấp:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const getSupplierById = async (req, res) => {
    try {
        const { id } = req.params;

        const supplierRef = db.collection('suppliers').doc(id);
        const supplier = await supplierRef.get();

        if (!supplier.exists) {
            return res.status(404).send({ message: 'Nhà cung cấp không tồn tại.' });
        }

        res.status(200).send({ id: supplier.id, ...supplier.data() });
    } catch (error) {
        console.error('Lỗi khi lấy nhà cung cấp:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, email, address, taxCode, timeRefund } = req.body;

        if (!name || !phone || !email || !address || !taxCode) {
            return res.status(400).send({ message: 'Tất cả các trường là bắt buộc.' });
        }

        const supplierRef = db.collection('suppliers').doc(id);
        const supplier = await supplierRef.get();

        if (!supplier.exists) {
            return res.status(404).send({ message: 'Nhà cung cấp không tồn tại.' });
        }

        await supplierRef.update({
            name,
            phone,
            email,
            address,
            taxCode,
            timeRefund,
            updatedAt: new Date().toISOString(),
        });

        res.status(200).send({ message: 'Nhà cung cấp đã được cập nhật thành công!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật nhà cung cấp:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;

        const supplierRef = db.collection('suppliers').doc(id);
        const supplier = await supplierRef.get();

        if (!supplier.exists) {
            return res.status(404).send({ message: 'Nhà cung cấp không tồn tại.' });
        }

        await supplierRef.delete();

        res.status(200).send({ message: 'Nhà cung cấp đã được xóa thành công!' });
    } catch (error) {
        console.error('Lỗi khi xóa nhà cung cấp:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

module.exports = {
    addSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
};
