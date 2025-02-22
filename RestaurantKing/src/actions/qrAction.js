export const getQRData = data => {
    return {
        type: 'GET_QRDATA',
        payload: data,
    };
};

export const resetQRData = () => ({
    type: 'RESET_QRDATA',
});

export const setTableKey = (tablekey) => ({
    type: 'SET_TABLEKEY',
    payload: tablekey,
});
