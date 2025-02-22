const initialState = {
    qrData: null,
};

const QRScanReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_QRDATA':
            return {
                ...state,
                qrData: action.payload,
            };
        case 'RESET_QRDATA':
            return initialState;
        default:
            return state;
    }
};

export default QRScanReducer;
