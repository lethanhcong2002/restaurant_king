const { db, bucket, admin } = require('./firebaseConfig.cjs');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');

const formatToVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

const calculateTotalAmount = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return 0;
    }
    return items.reduce((total, item) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
    }, 0);
};

const processPaymentAndSendInvoiceEmail = async (invoice, tableName) => {
    try {
        const formattedDate = new Date().toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
        const formattedDateWithWords = formattedDate.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, 'Ngày $1 tháng $2 năm $3');

        const htmlContent = `
        <html>
          <head>
            <title>Restaurant King</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
                margin-bottom: 50px;
              }
              h1, h2 {
                text-align: center;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                padding: 10px;
                text-align: left;
              }
              th {
                background-color: #f3f4f7;
              }
              .total {
                font-weight: bold;
              }
              footer {
                display: flex;
                justify-content: space-between;
                margin-top: 20px;
                font-size: 14px;
              }
              footer .left,
              footer .center,
              footer .right {
                width: 33.33%;
              }
              footer .right {
                text-align: right;
                padding-right: 10px;
              }
              footer p {
                text-align: center;
              }
            </style>
          </head>
          <body>
            <header>
              <h1>Restaurant King</h1>
              <p><strong>Mã hóa đơn:</strong> ${invoice?.code}</p>
              <p><strong>Tên khách hàng:</strong> ${invoice?.customerName}</p>
              <p><strong>Email:</strong> ${invoice?.customerEmail}</p>
              <p><strong>Số điện thoại:</strong> ${invoice?.customerPhone}</p>
              <p><strong>Bàn số:</strong> ${tableName}</p>
            </header>
            <h2>Danh sách món ăn</h2>
            <table>
              <thead>
                <tr>
                  <th>Tên món</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${invoice?.selectedItems.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatToVND(item.price)}</td>
                    <td>${formatToVND(item.quantity * item.price)}</td>
                  </tr>
                `).join('')}
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Tổng tiền:</strong></td>
                  <td><strong>${formatToVND(calculateTotalAmount(invoice?.selectedItems))}</strong></td>
                </tr>
              </tbody>
            </table>
            <footer>
              <div class="left"></div>
              <div class="center"></div>
              <div class="right">
                <p>${formattedDateWithWords}</p>
                <p><strong>Trân trọng,</strong></p>
                <p><strong>Restaurant King</strong></p>
              </div>
            </footer>
          </body>
        </html>
      `;

        // Tạo PDF từ HTML content
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: 'A4' });
        await browser.close();

        // Gửi email với đính kèm file PDF
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'hotrodichvu10@gmail.com',
                pass: 'xsmiessgctsxbovb',
            },
        });

        const mailOptions = {
            from: 'Nhà hàng Restaurant King <hotrodichvu10@gmail.com>',
            to: invoice.customerEmail,
            subject: `Hóa đơn thanh toán ${invoice.code}`,
            text: `Chào ${invoice.customerName},\n\nCảm ơn bạn đã thanh toán. Hóa đơn của bạn đã được đính kèm.\n\nTrân trọng,\nRestaurant King`,
            html: `
<div style="width: 100%; display: flex; justify-content: center; align-items: center; box-sizing: border-box; padding: 20px;">
    <div style="text-align: center; border: 2px solid #ccc; padding: 20px; font-size: 16px; display: inline-block; width: 100%; max-width: 600px;">
        <p>Chào ${invoice.customerName},</p>
        <p>Cảm ơn bạn rất nhiều vì đã lựa chọn Nhà hàng Restaurant King. Chúng tôi rất hân hạnh được phục vụ bạn!</p>
        <p>Hóa đơn thanh toán của bạn đã được đính kèm. Mã hóa đơn của bạn là <strong>${invoice.code}</strong> và ngày thanh toán là <strong>${new Date().toLocaleDateString('vi-VN')}</strong>.</p>

        <div style="text-align: center; margin-top: 20px; font-size: 18px;">
            <p>Trân trọng,</p>
            <p>Restaurant King</p>
        </div>
    </div>
</div>
`,
            attachments: [
                {
                    filename: `invoice_${invoice.code}.pdf`,
                    content: pdfBuffer,
                    encoding: 'base64',
                },
            ],
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.response);

        return {
            message: 'Payment processed and invoice sent successfully.',
            invoice,
        };

    } catch (error) {
        console.error('Error processing payment and sending email:', error);
        throw new Error('Internal Server Error');
    }
};


const deleteAllFilesInFolder = async (productId) => {
    const folderPath = `products/${productId}`;
    const [files] = await bucket.getFiles({ prefix: folderPath });

    if (files.length > 0) {
        const deletePromises = files.map(async (file) => {
            try {
                await file.delete();
            } catch (error) {
                console.error('Lỗi khi xóa hình ảnh:', error);
            }
        });

        await Promise.all(deletePromises);
    } else {
        console.log('Không có hình ảnh nào để xóa.');
    }
};

const deleteUnwantedFiles = async (folderId, retainedFileNames) => {
    try {
        const [files] = await bucket.getFiles({ prefix: `products/${folderId}/` });

        if (retainedFileNames.length === 0) {
            console.log('Không có file nào cần giữ lại. Không xóa file nào.');
            const deleteAllPromises = files.map(file => file.delete());
            await Promise.all(deleteAllPromises);
            return;
        }

        const filesToDelete = files.filter(file => {
            const fileName = file.name.split('/').pop();
            return !retainedFileNames.includes(fileName);
        });

        const deletePromises = filesToDelete.map(file => file.delete());
        await Promise.all(deletePromises);

    } catch (error) {
        console.error('Lỗi khi xóa file:', error);
    }
};

const generateInvoiceCode = (length = 8) => {
    const characters = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
    }
    return code;
};

const isInvoiceCodeUnique = async (code) => {
    const invoicesSnapshot = await db.collection('invoices').where('code', '==', code).get();
    return invoicesSnapshot.empty;
};

const generateUniqueInvoiceCode = async () => {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = generateInvoiceCode();
        isUnique = await isInvoiceCodeUnique(code);
    }

    return code;
};

const sendNotificationToCustomer = async (userId, title, body, notificationData) => {
    try {
        const userDoc = await db.collection('customers').doc(userId).get();
        const tokens = userDoc.data()?.fcmTokens;

        if (tokens && tokens.length > 0) {
            const failedTokens = [];

            for (const token of tokens) {
                const message = {
                    notification: {
                        title: title,
                        body: body,
                    },
                    token: token,
                    data: notificationData,
                };

                const response = await admin.messaging().send(message);

                if (response && response.startsWith("projects/")) {
                    console.log('Thông báo đã được gửi thành công đến token: ', token);
                } else {
                    console.log('Lỗi khi gửi thông báo đến token: ', token);
                    failedTokens.push(token);
                }
            }

            if (failedTokens.length > 0) {
                const userRef = db.collection('customers').doc(userId);
                await userRef.update({
                    fcmTokens: admin.firestore.FieldValue.arrayRemove(...failedTokens),
                });
                console.log(`Đã xóa các token không hợp lệ: ${failedTokens}`);
            }
        } else {
            console.log('Không có FCM Tokens để gửi thông báo.');
        }
    } catch (error) {
        console.error('Lỗi khi gửi thông báo:', error);
    }
};

const sendEmail = async ({ to, subject, text, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'hotrodichvu10@gmail.com',
                pass: 'xsmiessgctsxbovb',
            },
        });

        const info = await transporter.sendMail({
            from: 'Nhà hàng Restaurant King <hotrodichvu10@gmail.com>',
            to,
            subject,
            text,
            html,
        });

    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendMailRefund = async (invoiceId, supplierEmail, refundItems) => {
    try {
        const attachments = refundItems.flatMap((item, itemIndex) => {
            return item.blobUrls.map((base64, imgIndex) => ({
                filename: `refund-item-${itemIndex + 1}-image-${imgIndex + 1}.jpg`,
                content: base64.split('base64,')[1],
                encoding: 'base64',
                cid: `refund-item-${itemIndex + 1}-image-${imgIndex + 1}`
            }));
        });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'hotrodichvu10@gmail.com',
                pass: 'xsmiessgctsxbovb',
            },
        });

        const text = `Kính gửi nhà cung cấp,

Chúng tôi xin thông báo rằng các sản phẩm đã được hoàn trả với mã hóa đơn: ${invoiceId}.
Vui lòng kiểm tra chi tiết sản phẩm và hình ảnh đính kèm.

Trân trọng,
Nhà hàng Restaurant King`;

        const html = `<p>Kính gửi nhà cung cấp,</p>
        <p>Chúng tôi xin thông báo rằng các sản phẩm đã được hoàn trả. Dưới đây là chi tiết sản phẩm và hình ảnh đính kèm cho hóa đơn <strong>${invoiceId}</strong>:</p>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
            <thead>
                <tr>
                    <th>Sản phẩm</th>
                    <th>Số lượng hoàn trả</th>
                    <th>Lý do</th>
                    <th>Hình ảnh</th>
                </tr>
            </thead>
            <tbody>
                ${refundItems.map((item, itemIndex) => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.refundQuantity}</td>
                    <td>${item.refundReason}</td>
                    <td>
                        ${item.blobUrls.length > 0 ? item.blobUrls.map((_, imgIndex) => `<img src="cid:refund-item-${itemIndex + 1}-image-${imgIndex + 1}" alt="Hình ảnh sản phẩm hoàn trả ${imgIndex + 1}" style="max-width: 150px; margin-right: 5px;"/>`).join('') : 'Không có hình ảnh'}
                    </td>
                </tr>`).join('')}
            </tbody>
        </table>`;

        const mailOptions = {
            from: 'Nhà hàng Restaurant King <hotrodichvu10@gmail.com>',
            to: supplierEmail,
            subject: `Thông báo hoàn trả hàng - Hóa đơn: ${invoiceId}`,
            text,
            html,
            attachments,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};


module.exports = {
    deleteAllFilesInFolder,
    generateInvoiceCode,
    isInvoiceCodeUnique,
    generateUniqueInvoiceCode,
    sendNotificationToCustomer,
    sendEmail,
    deleteUnwantedFiles,
    sendMailRefund,
    processPaymentAndSendInvoiceEmail,
};