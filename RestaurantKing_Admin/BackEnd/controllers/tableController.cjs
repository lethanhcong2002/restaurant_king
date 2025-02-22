const { db, bucket } = require('../firebaseConfig.cjs');

const addRT = async (req, res) => {
    try {
        const { tableName, note, generatedId } = req.body;

        if (!tableName || !generatedId) {
            return res.status(400).send({ message: 'Tên bàn và mã UID là bắt buộc.' });
        }

        const tableData = {
            tableName,
            note,
            generatedId,
            createdAt: new Date().toISOString(),
            status: false,
        };

        const docRef = await db.collection('tables').add(tableData);

        res.status(200).send({
            message: 'Bàn đã được thêm thành công!',
            tableId: docRef.id,
        });
    } catch (error) {
        console.error('Lỗi khi thêm bàn:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const updateRT = async (req, res) => {
    const { id } = req.params;
    const { tableName, note, generatedId } = req.body;

    try {
        if (!tableName || !generatedId) {
            return res.status(400).send({ message: 'Tên bàn và mã UID là bắt buộc.' });
        }

        const tableRef = db.collection('tables').doc(id);

        await tableRef.update({
            tableName,
            note,
            generatedId,
            updatedAt: new Date().toISOString(),
        });

        res.status(200).send({ message: 'Bàn đã được chỉnh sửa thành công!' });
    } catch (error) {
        console.error('Lỗi khi chỉnh sửa bàn:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const deleteRT = async (req, res) => {
    const { id } = req.params;

    try {
        const tableDoc = await db.collection('tables').doc(id).get();

        if (!tableDoc.exists) {
            return res.status(404).send({ message: 'Bàn không tồn tại.' });
        }

        const tableData = tableDoc.data();

        if (tableData.status !== false) {
            return res.status(400).send({ message: 'Bàn không thể xóa, vì trạng thái không phải là false.' });
        }

        await db.collection('tables').doc(id).delete();

        res.status(200).send({ message: 'Bàn đã được xóa thành công.' });
    } catch (error) {
        console.error('Lỗi khi xóa bàn:', error);
        res.status(500).send({ message: 'Lỗi server khi xóa bàn.' });
    }
};

const getRT = async (req, res) => {
    try {
        const tablesSnapshot = await db.collection('tables').get();

        if (tablesSnapshot.empty) {
            return res.status(404).send({ message: 'Không có bàn nào.' });
        }

        const tables = [];
        tablesSnapshot.forEach(doc => {
            tables.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        tables.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).send(tables);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bàn:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

// const getRTById = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const tableDoc = await db.collection('tables').doc(id).get();

//         if (!tableDoc.exists) {
//             return res.status(404).send({ message: 'Bàn không tồn tại.' });
//         }

//         const tableData = tableDoc.data();
//         res.status(200).send(tableData);
//     } catch (error) {
//         console.error('Error fetching table:', error);
//         res.status(500).send({ message: 'Lỗi server khi lấy dữ liệu bàn.' });
//     }
// };

module.exports = {
    addRT,
    updateRT,
    deleteRT,
    getRT,
};
