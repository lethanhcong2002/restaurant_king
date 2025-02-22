export const getData = data => {
    return {
        type: 'GET_DATA',
        payload: data,
    };
};

export const resetData = () => ({
    type: 'RESET_DATA',
});