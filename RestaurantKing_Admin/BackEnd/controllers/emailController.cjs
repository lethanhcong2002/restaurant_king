// emailController.cjs
const { db } = require('../firebaseConfig.cjs');
const { sendEmail } = require('../utils.cjs');

const sendEmailController = async (req, res) => {
    const { to, subject, text, html } = req.body;
    try {
        await sendEmail({ to, subject, text, html });
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).send({ message: 'Failed to send email', error: error.message });
    }
};

const sendEmailToEmployeesController = async (req, res) => {
    const { title, message, description } = req.body;

    if (!title || !message) {
        return res.status(400).json({ message: 'Thiếu thông tin cần thiết (title, message).' });
    }

    const subject = title;
    const text = message;
    const html = description;

    try {
        const employeesSnapshot = await db.collection('admins').where('status', '==', true).get();

        if (employeesSnapshot.empty) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên nào với status = true.' });
        }

        const employeeEmails = employeesSnapshot.docs
            .map(doc => doc.data())
            .filter(employee => employee.email && employee.email.trim() !== '')
            .map(employee => employee.email);

        if (employeeEmails.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy nhân viên có email hợp lệ.' });
        }

        for (const email of employeeEmails) {
            try {
                await sendEmail({
                    to: email,
                    subject,
                    text,
                    html
                });
            } catch (error) {
                console.error(`Lỗi khi gửi email cho nhân viên ${email}:`, error);
            }
        }

        res.status(200).json({ message: 'Email đã được gửi đến tất cả nhân viên có email hợp lệ.' });
    } catch (error) {
        console.error('Lỗi khi truy vấn dữ liệu nhân viên:', error);
        res.status(500).json({ message: 'Lỗi khi gửi email cho nhân viên.', error: error.message });
    }
};

module.exports = {
    sendEmailController,
    sendEmailToEmployeesController
};
