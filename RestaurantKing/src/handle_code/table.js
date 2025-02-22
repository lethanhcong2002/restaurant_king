import firestore from '@react-native-firebase/firestore';

const TABLES = firestore().collection('tables');

const getTableByGeneratedId = async (generatedId) => {
    try {
        const querySnapshot = await TABLES.where('generatedId', '==', generatedId).get();

        if (querySnapshot.empty) {
            return { error: 'Table not found' };
        }

        const tableDoc = querySnapshot.docs[0];
        const tableData = tableDoc.data();

        if (tableData.status !== false) {
            return { error: 'The status of the table is not false' };
        }

        return {
            id: tableDoc.id,
            ...tableData,
        };

    } catch (error) {
        console.error('Error getting table data: ', error);
        return { error: 'Failed to fetch table data' };
    }
};

const getTableById = async (docId) => {
    try {
        const tableDoc = await TABLES.doc(docId).get();

        if (!tableDoc.exists) {
            return { error: 'Table not found' };
        }

        const tableData = tableDoc.data();

        return {
            id: tableDoc.id,
            ...tableData,
        };

    } catch (error) {
        console.error('Error getting table data: ', error);
        return { error: 'Failed to fetch table data' };
    }
};


const updateTableStatus = async (tableId, newStatus) => {
    try {
        const tableRef = TABLES.doc(tableId);

        await tableRef.update({
            status: newStatus,
        });

        console.log(`Table ${tableId} status updated to ${newStatus}`);
        return { success: true };

    } catch (error) {
        console.error('Error updating table status: ', error);
        return { error: 'Failed to update table status' };
    }
};
export { getTableByGeneratedId, updateTableStatus, getTableById };
