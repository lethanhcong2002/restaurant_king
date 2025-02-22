import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import { updateTableStatus } from './table';
import showToast from '../components/toastHelper';

const INVOICE = firestore().collection('invoices');
const EVALUATE = firestore().collection('evaluation');


const generateCode = async () => {
    let code = '';
    let isCodeUnique = false;

    while (!isCodeUnique) {
        code = Math.floor(10000000 + Math.random() * 90000000).toString();

        const querySnapshot = await INVOICE.where('code', '==', code).get();

        if (querySnapshot.empty) {
            isCodeUnique = true;
        }
    }

    return code;
};

const getInvoices = (userId, callback) => {
    try {
        if (!userId) {
            throw new Error('User ID is required.');
        }

        const unsubscribe = INVOICE.where('customerId', '==', userId)
            .onSnapshot(async querySnapshot => {
                if (querySnapshot.empty) {
                    callback([]);
                    return;
                }

                const invoices = [];

                for (const doc of querySnapshot.docs) {
                    const invoiceData = doc.data();

                    const selectedItemsSnapshot = await doc.ref.collection('selectedItems').get();
                    const selectedItems = selectedItemsSnapshot.empty
                        ? []
                        : selectedItemsSnapshot.docs.map(itemDoc => ({
                            id: itemDoc.id,
                            ...itemDoc.data(),
                        }));

                    invoices.push({
                        id: doc.id,
                        selectedItems: selectedItems,
                        ...invoiceData,
                    });
                }

                const filteredInvoices = invoices.filter(invoice => invoice.status === 0 || invoice.status === 1 || invoice.status === 3);

                const sortedInvoices = filteredInvoices.sort((a, b) => a.status - b.status);

                callback(sortedInvoices);
            });

        return unsubscribe;
    } catch (error) {
        Alert.alert('Error', 'Failed to fetch invoices: ' + error.message);
        console.error('Error fetching invoices: ', error);
        callback([]);
    }
};

const getALLInvoices = (userId, callback) => {
    try {
        if (!userId) {
            throw new Error('User ID is required.');
        }

        const unsubscribe = INVOICE.where('customerId', '==', userId)
            .onSnapshot(async querySnapshot => {
                if (querySnapshot.empty) {
                    callback([]);
                    return;
                }

                const invoices = [];

                await Promise.all(querySnapshot.docs.map(async doc => {
                    const invoiceData = doc.data();

                    const selectedItemsSnapshot = await doc.ref.collection('selectedItems').get();
                    const selectedItems = selectedItemsSnapshot.empty
                        ? []
                        : selectedItemsSnapshot.docs.map(itemDoc => ({
                            id: itemDoc.id,
                            ...itemDoc.data(),
                        }));

                    invoices.push({
                        id: doc.id,
                        selectedItems: selectedItems,
                        ...invoiceData,
                    });
                }));

                callback(invoices);
            });

        return unsubscribe;
    } catch (error) {
        Alert.alert('Error', 'Failed to fetch invoices: ' + error.message);
        console.error('Error fetching invoices: ', error);
        callback([]);
    }
};

const getPopular = (callback) => {
    try {
        const unsubscribe = INVOICE.onSnapshot(async querySnapshot => {
            if (querySnapshot.empty) {
                callback([]);
                return;
            }

            const allSelectedItems = [];

            await Promise.all(querySnapshot.docs.map(async doc => {
                const selectedItemsSnapshot = await doc.ref.collection('selectedItems').get();
                const selectedItems = selectedItemsSnapshot.empty
                    ? []
                    : selectedItemsSnapshot.docs.map(itemDoc => ({
                        itemId: itemDoc.data().itemId,
                        name: itemDoc.data().name,
                        ...itemDoc.data(),
                    }));

                selectedItems.forEach(item => allSelectedItems.push(item));
            }));

            const itemCount = {};
            allSelectedItems.forEach(item => {
                const itemId = item.itemId;
                if (itemCount[itemId]) {
                    itemCount[itemId] += 1;
                } else {
                    itemCount[itemId] = 1;
                }
            });

            const popularItems = Object.keys(itemCount).map(itemId => ({
                itemId: itemId,
                count: itemCount[itemId],
            }));

            popularItems.sort((a, b) => b.count - a.count);

            callback(popularItems);
        });

        return unsubscribe;
    } catch (error) {
        Alert.alert('Error', 'Failed to fetch popular items: ' + error.message);
        console.error('Error fetching popular items: ', error);
        callback([]);
    }
};

const createNewInvoice = async (data) => {
    try {
        if (!data || !data.appointmentTime) {
            throw new Error("Không được thiếu trường");
        }

        const code = await generateCode();

        await INVOICE.add({
            customerId: data.customerId,
            customerEmail: data.customerEmail,
            customerName: data.customerName,
            createdAt: new Date().toISOString(),
            customerPhone: data.customerPhone || '',
            appointmentTime: data.appointmentTime,
            tableOccupancy: Number(data.number),
            status: 3,
            code: code,
            notes: data.notes || '',
        });

        return true;
    } catch (error) {
        Alert.alert('Error', error.message);
        throw new Error(error.message);
    }
};

const createNewInvoiceAfterScan = async (data) => {
    try {
        if (!data || !data.appointmentTime) {
            throw new Error("Không được thiếu trường");
        }

        const code = await generateCode();

        const invoiceRef = await INVOICE.add({
            customerId: data.customerId,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            createdAt: new Date().toISOString(),
            customerPhone: data.customerPhone || '',
            appointmentTime: data.appointmentTime,
            tableOccupancy: Number(data.number),
            status: 1,
            code: code,
            notes: data.notes || '',
        });

        const newInvoiceSnapshot = await invoiceRef.get();
        const newInvoiceData = {
            id: invoiceRef.id,
            ...newInvoiceSnapshot.data(),
        };

        showToast("success", "Thông báo", "Tạo thành công!")

        return newInvoiceData;
    } catch (error) {
        Alert.alert('Error', error.message);
        throw new Error(error.message);
    }
};

const updateInvoice = async (invoiceId, updatedData) => {
    try {
        if (!invoiceId || !updatedData) {
            throw new Error("Thiếu dữ liệu cập nhật hoặc ID hóa đơn.");
        }

        await INVOICE.doc(invoiceId).update({
            customerName: updatedData.customerName,
            customerPhone: updatedData.customerPhone || '',
            appointmentTime: updatedData.appointmentTime,
            tableOccupancy: Number(updatedData.number),
            status: 3,
            notes: updatedData.notes || '',
            updatedAt: new Date().toISOString(),
        });

        return 'Cập nhật thành công.';
    } catch (error) {
        throw new Error(error.message);
    }
};

const updateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
        if (![0, 1, 2, 3, 4].includes(newStatus)) {
            throw new Error('Invalid status value.');
        }

        await INVOICE.doc(invoiceId).update({
            status: newStatus,
            updatedAt: new Date().toISOString(),
        });

        console.log('Invoice status updated successfully');
    } catch (error) {
        console.error('Error updating invoice status: ', error);
        throw new Error('Failed to update invoice status');
    }
};

const updateTable_Dishes = async (dataConfirm) => {
    try {
        await updateTableStatus(dataConfirm.selectedTable, true);

        const invoiceRef = INVOICE.doc(dataConfirm.orderId);
        const invoiceSnapshot = await invoiceRef.get();

        if (!invoiceSnapshot.exists) {
            throw new Error('Invoice not found');
        }

        await invoiceRef.update({
            selectedTable: dataConfirm.selectedTable,
            status: 0,
            updatedAt: new Date().toISOString(),
        });

        const selectedItemsRef = invoiceRef.collection('selectedItems');
        const batch = firestore().batch();

        dataConfirm.selectedDishes.forEach((dish) => {
            const dishDocRef = selectedItemsRef.doc();
            batch.set(dishDocRef, {
                itemId: dish.id,
                name: dish.name,
                price: dish.price,
                quantity: dish.quantity,
                isSelected: true,
                change: 'added',
            });
        });

        await batch.commit();

        console.log('Table and invoice with selected dishes updated successfully');

    } catch (error) {
        console.error('Error updating table and dishes: ', error);
        throw new Error('Failed to update table and selected dishes');
    }
};

const updateOrderAgain = async (dataConfirm) => {
    try {
        const invoiceRef = INVOICE.doc(dataConfirm.orderId);
        const invoiceSnapshot = await invoiceRef.get();

        if (!invoiceSnapshot.exists) {
            throw new Error('Invoice not found');
        }

        await invoiceRef.update({
            updatedAt: new Date().toISOString(),
        });

        const selectedItemsRef = invoiceRef.collection('selectedItems');
        const batch = firestore().batch();

        for (const dish of dataConfirm.selectedDishes) {
            const dishDocRef = selectedItemsRef.doc(dish.id);

            const existingDishSnapshot = await dishDocRef.get();

            switch (dish.change) {
                case 'added':
                    if (!existingDishSnapshot.exists) {
                        batch.set(dishDocRef, {
                            itemId: dish.itemId,
                            name: dish.name,
                            price: dish.price,
                            quantity: dish.quantity,
                            isSelected: true,
                        });
                    }
                    break;

                case 'removed':
                    if (existingDishSnapshot.exists) {
                        batch.delete(dishDocRef);
                    }
                    break;

                default:
                    if (existingDishSnapshot.exists) {
                        batch.update(dishDocRef, {
                            quantity: dish.quantity,
                            change: dish.change,
                        });
                    }
                    break;
            }
        }

        await batch.commit();
    } catch (error) {
        console.error('Error updating table and dishes: ', error);
        throw new Error('Failed to update table and selected dishes');
    }
};


const serviceRating = async (invoiceId, score, evaluate, code) => {
    try {
        const createdAt = new Date().toISOString();

        await EVALUATE.add({
            invoiceId: invoiceId,
            code: code,
            score: score,
            evaluate: evaluate,
            createdAt: createdAt,
        });

        await INVOICE.doc(invoiceId).update({
            rating: true,
        });

        return true;
    } catch (error) {
        console.error('Error adding rating and updating invoice:', error);

        return false;
    }
};

export { createNewInvoice, getInvoices, updateInvoiceStatus, updateInvoice, updateTable_Dishes, createNewInvoiceAfterScan, updateOrderAgain, getALLInvoices, getPopular, serviceRating };
