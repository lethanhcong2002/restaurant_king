const bcrypt = require('bcrypt');
const { db, bucket } = require('../firebaseConfig.cjs');

const loginAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ message: 'Vui lòng cung cấp đầy đủ thông tin đăng nhập.' });
        }

        const userSnapshot = await db.collection('admins').where('username', '==', username).get();
        if (userSnapshot.empty) {
            return res.status(401).send({ message: 'Tên người dùng không tồn tại.' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        const isPasswordValid = await bcrypt.compare(password, userData.password);

        if (isPasswordValid) {
            return res.status(200).send({
                message: 'Đăng nhập thành công!',
                user: { id: userDoc.id, ...userData },
            });
        } else {
            return res.status(401).send({ message: 'Mật khẩu không chính xác.' });
        }
    } catch (error) {
        console.error('Lỗi khi đăng nhập:', error);
        return res.status(500).send({ message: 'Lỗi server.' });
    }
};

const changePassword = async (req, res) => {
    try {
        const id = req.params.id;
        const { passwordOld, passwordNew } = req.body;

        if (!passwordOld || !passwordNew || !id) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const userSnapshot = await db.collection('admins').doc(id).get();

        if (!userSnapshot.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userSnapshot.data();

        const isPasswordMatch = await bcrypt.compare(passwordOld, userData.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Old password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(passwordNew, 10);

        await db.collection('admins').doc(id).update({
            password: hashedPassword,
        });

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const snapshot = await db.collection('admins').get();

        if (snapshot.empty) {
            return res.status(200).send([]);
        }

        const admins = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        admins.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateA - dateB;
        });

        res.status(200).send(admins);

    } catch (error) {
        console.error('Lỗi khi lấy danh sách admins:', error);
        return res.status(500).send({ message: 'Lỗi server.' });
    }
};

const createAccounts = async (req, res) => {
    try {
        const { quantity, password } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).send({ message: 'Số lượng tài khoản không hợp lệ.' });
        }

        const allAccountsSnapshot = await db.collection('admins').get();

        let lastUsernameIndex = 0;
        let lastCreatedAt = null;

        allAccountsSnapshot.forEach(doc => {
            const accountData = doc.data();
            const createdAt = new Date(accountData.createdAt);
            if (!lastCreatedAt || createdAt > lastCreatedAt) {
                lastCreatedAt = createdAt;
                const lastUsername = accountData.username;

                const match = lastUsername.match(/admin(\d+)/);
                if (match) {
                    lastUsernameIndex = parseInt(match[1]);
                }
            }
        });

        const accountsToCreate = [];
        for (let i = 0; i < quantity; i++) {
            const username = `admin${lastUsernameIndex + i + 1}`;
            const hashedPassword = await bcrypt.hash(password, 10);

            accountsToCreate.push({
                username: username,
                password: hashedPassword,
                name: '',
                phone: '',
                email: '',
                role: 0,
                salary: 0,
                status: false,
                createdAt: new Date().toISOString(),
            });
        }

        const batch = db.batch();
        accountsToCreate.forEach(account => {
            const accountRef = db.collection('admins').doc();
            batch.set(accountRef, account);
        });

        await batch.commit();

        res.status(201).send({
            message: `Đã tạo thành công ${quantity} tài khoản!`,
            accountsCreated: accountsToCreate.map(acc => acc.username),
        });
    } catch (error) {
        console.error('Lỗi khi tạo tài khoản:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const updateAccount = async (req, res) => {
    try {
        const accountId = req.params.id;
        const { name, phone, email, salary, role } = req.body;

        if (!accountId || !name || !phone || !email || salary === undefined || role === undefined) {
            return res.status(400).send({ message: 'Vui lòng cung cấp đầy đủ thông tin để cập nhật.' });
        }

        const accountRef = db.collection('admins').doc(accountId);

        await accountRef.update({
            name: name,
            phone: phone,
            email: email,
            salary: salary,
            role: role,
            status: true,
            updatedAt: new Date().toISOString(),
        });

        res.status(200).send({ message: 'Cập nhật tài khoản thành công!' });
    } catch (error) {
        console.error('Lỗi khi cập nhật tài khoản:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

const resetAccount = async (req, res) => {
    try {
        const accountId = req.params.id;

        if (!accountId) {
            return res.status(400).send({ message: 'Vui lòng cung cấp ID tài khoản.' });
        }

        const hashedPassword = await bcrypt.hash('123456789', 10);
        const accountRef = db.collection('admins').doc(accountId);

        await accountRef.update({
            password: hashedPassword,
            name: '',
            phone: '',
            email: '',
            salary: 0,
            role: 0,
            status: false,
            updatedAt: new Date().toISOString(),
        });

        res.status(200).send({ message: 'Tài khoản đã được reset về mặc định!' });
    } catch (error) {
        console.error('Lỗi khi reset tài khoản:', error);
        res.status(500).send({ message: 'Lỗi server.' });
    }
};

module.exports = {
    loginAdmin,
    getAllAdmins,
    createAccounts,
    updateAccount,
    resetAccount,
    changePassword
};
