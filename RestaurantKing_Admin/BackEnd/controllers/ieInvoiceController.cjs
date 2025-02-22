const { db, admin } = require('../firebaseConfig.cjs');
const { generateUniqueInvoiceCode, sendMailRefund } = require('../utils.cjs');

const getInvoicesIE = async (req, res) => {
    try {
        const invoicesSnapshot = await db.collection('ie_invoices').get();

        if (invoicesSnapshot.empty) {
            return res.status(200).json([]);
        }

        const invoicePromises = invoicesSnapshot.docs.map(async (doc) => {
            const itemsSnapshot = await doc.ref.collection('items').get();
            const items = [];

            itemsSnapshot.forEach(itemDoc => {
                items.push({
                    id: itemDoc.id,
                    ...itemDoc.data(),
                });
            });

            const { userId, userName } = doc.data();

            const adminDoc = await db.collection('admins')
                .doc(userId)
                .get();

            let adminExist = false;

            if (adminDoc.exists) {
                const adminData = adminDoc.data();
                if (adminData.name === userName) {
                    adminExist = true;
                }
            }

            return {
                id: doc.id,
                items,
                adminExist,
                ...doc.data(),
            };
        });

        const resolvedInvoices = await Promise.all(invoicePromises);

        res.status(200).json(resolvedInvoices);
    } catch (error) {
        console.error('Error retrieving invoices:', error);
        res.status(500).send('Internal Server Error');
    }
};

const addInvoiceImport = async (req, res) => {
    try {
        const { supplier, selectedItems, userId, notes, userName } = req.body;
        const code = await generateUniqueInvoiceCode();
        const invoiceData = {
            code,
            userId,
            userName,
            supplierId: supplier.supplierId,
            timeRefund: supplier.timeRefund,
            supplierName: supplier.supplierName,
            supplierPhone: supplier.supplierPhone,
            supplierEmail: supplier.supplierEmail,
            notes,
            status: false,
            refund: false,
            type: true,
            createdAt: new Date().toISOString(),
        };

        const invoiceRef = await db.collection('ie_invoices').add(invoiceData);

        const itemsCollectionRef = invoiceRef.collection('items');
        const itemsPromises = selectedItems.map(async (item) => {
            await itemsCollectionRef.add({
                itemId: item.itemId,
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                price: item.price,
                refundReason: '',
                refundQuantity: 0,
            });
        });

        await Promise.all(itemsPromises);

        res.status(200).json({
            id: invoiceRef.id,
            message: 'Invoice created successfully!',
            ...invoiceData,
        });
    } catch (error) {
        console.error('Error saving invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

const addInvoiceExport = async (req, res) => {
    try {
        const { selectedItems, userId, userName } = req.body;

        const code = await generateUniqueInvoiceCode();

        const invoiceData = {
            code,
            userId,
            userName,
            status: true,
            type: false,
            createdAt: new Date().toISOString(),
        };

        const invoiceRef = await db.collection('ie_invoices').add(invoiceData);
        const itemsCollectionRef = invoiceRef.collection('items');

        const itemsPromises = selectedItems.map(async (item) => {
            await itemsCollectionRef.add({
                itemId: item.itemId,
                name: item.name,
                originalQuantity: item.originalQuantity,
                exportQuantity: Number(item.exportQuantity),
                unit: item.unit,
                exportReasonStatus: item.exportReasonStatus,
                note: item.description || '',
            });
            console.log(itemsCollectionRef);
            const storageRef = db.collection('storage').doc(item.itemId);
            await storageRef.update({
                currentQuantity: admin.firestore.FieldValue.increment(-Number(item.exportQuantity)),
            });
        });

        await Promise.all(itemsPromises);

        res.status(200).json({
            id: invoiceRef.id,
            message: 'Invoice created successfully!',
            ...invoiceData,
        });
    } catch (error) {
        console.error('Error saving invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

const updateInvoiceIE = async (req, res) => {
    try {
        const { updatedItems } = req.body;
        const id = req.params.id;

        const invoiceRef = db.collection('ie_invoices').doc(id);
        const invoiceDoc = await invoiceRef.get();

        if (!invoiceDoc.exists) {
            return res.status(404).send('Invoice not found');
        }

        await invoiceRef.update({
            status: true,
            receivingDate: new Date().toISOString(),
        });

        const itemsCollectionRef = invoiceRef.collection('items');
        const errors = [];

        const updatePromises = updatedItems.map(async (item) => {
            try {
                const itemRef = itemsCollectionRef.doc(item.id);
                await itemRef.update({
                    actualQuantity: item.actualQuantity,
                    actualPrice: item.actualPrice,
                    note: item.note,
                });

                const storageRef = db.collection('storage').doc(item.itemId);
                await storageRef.update({
                    currentQuantity: admin.firestore.FieldValue.increment(Number(item.actualQuantity)),
                });
            } catch (itemError) {
                console.error(`Error updating item with ID ${item.id}:`, itemError);
                errors.push({ id: item.id, error: itemError.message });
            }
        });

        await Promise.all(updatePromises);

        if (errors.length > 0) {
            return res.status(207).json({
                message: 'Invoice updated with some errors',
                id,
                errors,
            });
        }

        res.status(200).json({
            message: 'Invoice updated successfully!',
            id,
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

const refundInvoice = async (req, res) => {
    const { updatedItems } = req.body;
    const id = req.params.id;
    console.log(updatedItems.items);
    try {
        const invoiceRef = db.collection('ie_invoices').doc(id);
        const invoiceDoc = await invoiceRef.get();

        if (!invoiceDoc.exists) {
            return res.status(404).send('Invoice not found');
        }

        await invoiceRef.update({
            refund: true,
            refundDate: new Date().toISOString(),
        });

        const itemsCollectionRef = invoiceRef.collection('items');
        const errors = [];
        const refundItems = [];

        const updatePromises = updatedItems.items.map(async (item) => {
            try {
                const itemRef = itemsCollectionRef.doc(item.id);

                await itemRef.update({
                    refundReason: item.refundReason || '',
                    refundQuantity: item.refundQuantity || 0,
                });

                refundItems.push({
                    name: item.name,
                    refundQuantity: item.refundQuantity,
                    refundReason: item.refundReason,
                    blobUrls: item.blobUrls || [],
                });

                const storageRef = db.collection('storage').doc(item.itemId);
                const storageDoc = await storageRef.get();

                if (!storageDoc.exists) {
                    throw new Error(`Storage record not found for item ID ${item.itemId}`);
                }

                const currentQuantity = storageDoc.data().currentQuantity || 0;
                const refundQuantity = Number(item.refundQuantity || 0);

                if (refundQuantity <= currentQuantity) {
                    await storageRef.update({
                        currentQuantity: admin.firestore.FieldValue.increment(-refundQuantity),
                    });
                }
            } catch (itemError) {
                console.error(`Error updating item with ID ${item.id}:`, itemError);
                errors.push({ id: item.id, error: itemError.message });
            }
        });

        await Promise.all(updatePromises);

        if (errors.length > 0) {
            return res.status(207).json({
                message: 'Invoice updated with some errors',
                id,
                errors,
            });
        }

        await sendMailRefund(updatedItems.code, updatedItems.email, refundItems);

        res.status(200).json({
            message: 'Invoice updated successfully and email sent!',
            id,
        });
    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

const deleteInvoiceIE = async (req, res) => {
    try {
        const id = req.params.id;
        const invoiceRef = db.collection('ie_invoices').doc(id);
        const invoiceDoc = await invoiceRef.get();

        if (!invoiceDoc.exists) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        const itemsCollectionRef = invoiceRef.collection('items');
        const itemsSnapshot = await itemsCollectionRef.get();

        const deleteItemsPromises = itemsSnapshot.docs.map(async (doc) => {
            await doc.ref.delete();
        });

        await Promise.all(deleteItemsPromises);
        await invoiceRef.delete();

        res.status(200).json({ message: 'Invoice and related items deleted successfully!' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    addInvoiceImport,
    updateInvoiceIE,
    getInvoicesIE,
    deleteInvoiceIE,
    addInvoiceExport,
    refundInvoice
};
