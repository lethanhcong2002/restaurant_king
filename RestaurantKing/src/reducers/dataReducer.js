const initialState = {
    data: null,
};

const DataReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'GET_DATA':
            return {
                ...state,
                data: action.payload,
            };
        case 'RESET_DATA':
            return initialState;
        default:
            return state;
    }
};

export default DataReducer;
