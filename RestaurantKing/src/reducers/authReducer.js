// reducers/authReducer.js
const initialState = {
    userData: null,
    typeLogin: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'LOGIN':
            return {
                ...state,
                userData: action.payload.userData,
                typeLogin: action.payload.typeLogin,
            };
        case 'LOGOUT':
            return {
                ...state,
                userData: null,
                typeLogin: null,
            };
        case 'UPDATE_DETAIL':
            return {
                ...state,
                userData: action.payload,
            };
        case 'UPDATE_AVATAR_URL':
            return {
                ...state,
                userData: {
                    ...state.userData,
                    photoURL: action.payload,
                },
            };
        default:
            return state;
    }
};

export default authReducer;
