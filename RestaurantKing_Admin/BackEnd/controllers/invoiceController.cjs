// invoiceController.js
const { db, bucket } = require('../firebaseConfig.cjs');
const { generateUniqueInvoiceCode, processPaymentAndSendInvoiceEmail } = require('../utils.cjs');

const addInvoice = async (req, res) => {
    try {
        const { customerName, customerEmail, customerPhone, selectedTable, selectedItems } = req.body;

        if (!customerName || !customerEmail || !customerPhone || !selectedTable || !selectedItems || selectedItems.length === 0) {
            return res.status(400).json({ message: 'Missing required fields or no items selected.' });
        }

        const code = await generateUniqueInvoiceCode();

        const tableRef = db.collection('tables').doc(selectedTable);
        const tableDoc = await tableRef.get();

        if (!tableDoc.exists) {
            return res.status(404).json({ message: 'Table not found' });
        }

        const invoiceData = {
            code,
            customerName,
            customerEmail,
            customerPhone,
            selectedTable,
            createdAt: new Date().toISOString(),
            status: 0
        };

        const invoiceRef = await db.collection('invoices').add(invoiceData);

        const selectedItemsPromises = selectedItems.map(item => {
            if (!item.name || !item.price || item.quantity < 1) {
                throw new Error('Invalid item data');
            }
            return invoiceRef.collection('selectedItems').add(item);
        });

        await Promise.all(selectedItemsPromises);

        await tableRef.update({ status: true });

        res.status(200).json({
            id: invoiceRef.id,
            message: 'Invoice created successfully!',
            ...invoiceData,
        });

    } catch (error) {
        console.error('Error saving invoice:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

const getInvoices = async (req, res) => {
    try {
        const invoicesSnapshot = await db.collection('invoices').get();

        const invoices = await Promise.all(invoicesSnapshot.docs.map(async (doc) => {
            const invoiceData = doc.data();

            const selectedItemsSnapshot = await doc.ref.collection('selectedItems').get();
            const selectedItems = selectedItemsSnapshot.docs.map(itemDoc => itemDoc.data());

            return {
                id: doc.id,
                ...invoiceData,
                selectedItems,
            };
        }));

        invoices.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });

        res.status(200).json(invoices);

    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).send('Internal Server Error');
    }
};

const updateInvoiceStatus = async (req, res) => {
    const { id } = req.params;
    const { status, tableId } = req.body;

    try {
        const invoiceRef = db.collection('invoices').doc(id);
        const invoiceDoc = await invoiceRef.get();

        if (!invoiceDoc.exists) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        await invoiceRef.update({ status });

        if (status === 2) {
            const tableRef = db.collection('tables').doc(tableId);
            await tableRef.update({ status: false });
        }

        res.status(200).json({ message: 'Invoice status updated and table status conditionally updated successfully' });
    } catch (error) {
        console.error('Error updating invoice and table status:', error);
        res.status(500).send('Internal Server Error');
    }
};

const processPayment = async (req, res) => {
    const { id } = req.params;
    const { tableId, tableName, invoice } = req.body;

    try {
        const invoiceRef = db.collection('invoices').doc(id);
        const invoiceDoc = await invoiceRef.get();

        if (!invoiceDoc.exists) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        await invoiceRef.update({ status: 2 });

        const tableRef = db.collection('tables').doc(tableId);
        await tableRef.update({ status: false });

        await processPaymentAndSendInvoiceEmail(invoice, tableName);

        res.status(200).json({
            message: 'Payment processed successfully, invoice status updated and table status updated.',
            invoice,
            tableId
        });
    } catch (error) {
        console.error('Error processing payment and updating status:', error);
        res.status(500).send('Internal Server Error');
    }
};

// const getInvoiceDashboard = async (req, res) => {
//     try {
//         const invoicesSnapshot = await db.collection('invoices').get();

//         const invoices = invoicesSnapshot.docs.map(doc => ({
//             ...doc.data(),
//             id: doc.id,
//         }));

//         const invoiceCountsByMonth = new Array(12).fill(0);
//         const totalPriceByMonth = new Array(12).fill(0);

//         const currentYear = new Date().getFullYear();

//         const promises = invoices.map(async (invoice) => {
//             const invoiceDate = new Date(invoice.createdAt);
//             if (isNaN(invoiceDate.getTime())) {
//                 console.log('Invalid createdAt for invoice:', invoice);
//                 return;
//             }

//             const month = invoiceDate.getMonth();
//             const year = invoiceDate.getFullYear();

//             if (year === currentYear && invoice.status !== 4) {
//                 invoiceCountsByMonth[month]++;

//                 const selectedItemsSnapshot = await db.collection('invoices').doc(invoice.id).collection('selectedItems').get();
//                 selectedItemsSnapshot.docs.forEach(itemDoc => {
//                     const itemData = itemDoc.data();
//                     const totalItemPrice = itemData.price * itemData.quantity;
//                     totalPriceByMonth[month] += totalItemPrice;
//                 });
//             }
//         });

//         await Promise.all(promises);

//         res.status(200).json({
//             success: true,
//             data: {
//                 invoiceCountsByMonth,
//                 totalPriceByMonth,
//             },
//         });
//     } catch (error) {
//         console.error('Error in /invoice_dashboard:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Lỗi khi lấy danh sách hóa đơn',
//             error: error.message,
//         });
//     }
// };

const getInvoiceDashboard = async (req, res) => {
    try {
        const invoicesSnapshot = await db.collection('invoices').get();
        const invoices = invoicesSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));

        const ieInvoicesSnapshot = await db.collection('ie_invoices').where('type', '==', true).get();
        const ieInvoices = ieInvoicesSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        }));

        const invoiceCountsByMonth = new Array(12).fill(0);
        const totalPriceByMonth = new Array(12).fill(0);
        const totalExpensesByMonth = new Array(12).fill(0);

        const currentYear = new Date().getFullYear();

        const invoicePromises = invoices.map(async (invoice) => {
            const invoiceDate = new Date(invoice.createdAt);
            if (isNaN(invoiceDate.getTime())) {
                console.log('Invalid createdAt for invoice:', invoice);
                return;
            }

            const month = invoiceDate.getMonth();
            const year = invoiceDate.getFullYear();

            if (year === currentYear && invoice.status !== 4) {
                invoiceCountsByMonth[month]++;

                const selectedItemsSnapshot = await db.collection('invoices').doc(invoice.id).collection('selectedItems').get();
                selectedItemsSnapshot.docs.forEach(itemDoc => {
                    const itemData = itemDoc.data();
                    const totalItemPrice = itemData.price * itemData.quantity;
                    totalPriceByMonth[month] += totalItemPrice;
                });
            }
        });

        const ieInvoicePromises = ieInvoices.map(async (ieInvoice) => {
            const ieInvoiceDate = new Date(ieInvoice.createdAt);
            if (isNaN(ieInvoiceDate.getTime())) {
                console.log('Invalid createdAt for ie_invoice:', ieInvoice);
                return;
            }

            const month = ieInvoiceDate.getMonth();
            const year = ieInvoiceDate.getFullYear();

            if (year === currentYear) {
                const ieItemsSnapshot = await db.collection('ie_invoices').doc(ieInvoice.id).collection('items').get();
                ieItemsSnapshot.docs.forEach(ieItemDoc => {
                    const ieItemData = ieItemDoc.data();
                    const actualQuantity = ieItemData.actualQuantity || 0;
                    const refundQuantity = ieItemData.refundQuantity || 0;
                    const price = ieItemData.price || 0;
                    const totalExpense = (actualQuantity - refundQuantity) * price;
                    totalExpensesByMonth[month] += totalExpense;
                });
            }
        });

        await Promise.all([...invoicePromises, ...ieInvoicePromises]);

        res.status(200).json({
            success: true,
            data: {
                invoiceCountsByMonth,
                totalPriceByMonth,
                totalExpensesByMonth,
            },
        });
    } catch (error) {
        console.error('Error in /invoice_dashboard:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message,
        });
    }
};

const getInvoiceHome = async (req, res) => {
    try {
        const invoicesSnapshot = await db.collection('invoices').get();

        const filteredInvoices = invoicesSnapshot.docs
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
            }))
            .filter(invoice => [0, 1, 3].includes(invoice.status));

        const sortedInvoices = filteredInvoices.sort((a, b) => {
            const order = [3, 1, 0];
            return order.indexOf(a.status) - order.indexOf(b.status);
        });

        const invoicesWithTotal = await Promise.all(
            sortedInvoices.map(async (invoice) => {
                let totalPrice = 0;

                try {
                    const selectedItemsSnapshot = await db.collection('invoices').doc(invoice.id).collection('selectedItems').get();
                    selectedItemsSnapshot.docs.forEach(itemDoc => {
                        const itemData = itemDoc.data();
                        totalPrice += itemData.price * itemData.quantity;
                    });
                } catch (error) {
                    console.error(`Error fetching selectedItems for invoice ${invoice.id}:`, error);
                }

                return {
                    ...invoice,
                    totalPrice,
                };
            })
        );

        res.status(200).json({
            success: true,
            data: invoicesWithTotal,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách hóa đơn',
            error: error.message,
        });
    }
};

module.exports = {
    addInvoice,
    getInvoices,
    updateInvoiceStatus,
    getInvoiceDashboard,
    getInvoiceHome,
    processPayment,
};
