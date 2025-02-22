// storageController.cjs
const { db } = require('../firebaseConfig.cjs');

const addStorage = async (req, res) => {
    try {
        const {
            name,
            category,
            currentQuantity,
            minQuantity,
            price,
            supplier,
            unit,
            importDate,
            expiryDate,
            notes,
        } = req.body;

        const missingFields = [];
        if (!name) missingFields.push('Tên');
        if (!category) missingFields.push('Danh mục');
        if (!currentQuantity) missingFields.push('Số lượng hiện tại');
        if (!minQuantity) missingFields.push('Số lượng tối thiểu');
        if (!price) missingFields.push('Giá nhập');
        if (!supplier) missingFields.push('Nhà cung cấp');
        if (!unit) missingFields.push('Đơn vị tính');
        if (!importDate) missingFields.push('Ngày nhập kho');

        if (missingFields.length > 0) {
            return res.status(400).send({ message: `Các trường sau đây là bắt buộc: ${missingFields.join(', ')}.` });
        }

        const storageData = {
            name,
            category: Number(category),
            currentQuantity: parseInt(currentQuantity, 10),
            minQuantity: parseInt(minQuantity, 10),
            price: parseFloat(price),
            supplier,
            unit,
            importDate: new Date(importDate).toISOString(),
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
            notes: notes || '',
            createdAt: new Date().toISOString(),
            status: true,
        };

        const docRef = await db.collection('storage').add(storageData);
        res.status(200).send({
            message: 'Kho hàng đã được thêm thành công!',
            storageId: docRef.id,
        });
    } catch (error) {
        console.error('Lỗi khi thêm kho hàng:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const getStorage = async (req, res) => {
    try {
        const storageSnapshot = await db.collection('storage').get();

        if (storageSnapshot.empty) {
            return res.status(200).send([]);
        }

        const storageData = [];

        for (const doc of storageSnapshot.docs) {
            const storageItem = { id: doc.id, ...doc.data() };

            const supplierRef = db.collection('suppliers').doc(storageItem.supplier);
            const supplierDoc = await supplierRef.get();
            if (supplierDoc.exists) {
                storageItem.supplierData = { id: supplierDoc.id, ...supplierDoc.data() };
            } else {
                storageItem.supplierData = null;
            }

            storageData.push(storageItem);
        }

        storageData.sort((a, b) => {
            if (a.status !== b.status) return a.status === true ? -1 : 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.status(200).send(storageData);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu kho hàng:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const updateStorageStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const storageRef = db.collection('storage').doc(id);
        const docSnapshot = await storageRef.get();

        if (!docSnapshot.exists) {
            return res.status(404).send({ message: 'Không tìm thấy kho hàng.' });
        }

        await storageRef.update({ status });
        const message = status ? 'Kho hàng đã được khôi phục.' : 'Kho hàng đã được ẩn.';
        res.status(200).send({ message });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái kho hàng:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const getStorageById = async (req, res) => {
    const { id } = req.params;

    try {
        const storageRef = db.collection('storage').doc(id);
        const storage = await storageRef.get();

        if (!storage.exists) {
            return res.status(404).send({ message: 'Kho hàng không tồn tại.' });
        }

        res.status(200).send({ id: storage.id, ...storage.data() });
    } catch (error) {
        console.error('Lỗi khi lấy kho hàng:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const updateStorage = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const storageRef = db.collection('storage').doc(id);
        const storage = await storageRef.get();

        if (!storage.exists) {
            return res.status(404).send({ message: 'Kho hàng không tồn tại.' });
        }

        await storageRef.update(updatedData);
        res.status(200).send({ message: 'Cập nhật thành công.', id: storage.id, ...updatedData });
    } catch (error) {
        console.error('Lỗi khi cập nhật kho hàng:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const getStorageBySupplier = async (req, res) => {
    const supplierId = req.params.id;

    try {
        const storageSnapshot = await db.collection('storage')
            .where('supplier', '==', supplierId)
            .get();

        if (storageSnapshot.empty) {
            return res.status(404).send({ message: 'Không tìm thấy kho hàng cho nhà cung cấp này.' });
        }

        const storageData = [];
        storageSnapshot.forEach(doc => storageData.push({ id: doc.id, ...doc.data() }));
        res.status(200).send(storageData);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu kho hàng:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

module.exports = {
    addStorage,
    getStorage,
    updateStorageStatus,
    getStorageById,
    updateStorage,
    getStorageBySupplier,
};
