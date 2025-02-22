// reducer.js
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const REMOVE_OLD_NOTIFICATIONS = 'REMOVE_OLD_NOTIFICATIONS';
const DELETE_NOTIFICATION = 'DELETE_NOTIFICATION';

const initialState = {
    notificationList: [],
};

const notifiReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_NOTIFICATION:
            return {
                ...state,
                notificationList: [...state.notificationList, action.payload],
            };

        case REMOVE_OLD_NOTIFICATIONS:
            return {
                ...state,
                notificationList: state.notificationList.filter(
                    notification => notification.timestamp >= action.payload
                ),
            };

        case DELETE_NOTIFICATION:
            return {
                ...state,
                notificationList: state.notificationList.filter(
                    notification => notification.id !== action.payload
                ),
            };

        case 'MARK_AS_READ':
            return {
                ...state,
                notificationList: state.notificationList.map((notification) =>
                    notification.id === action.payload
                        ? { ...notification, status: true }
                        : notification
                ),
            };

        default:
            return state;
    }
};

export default notifiReducer;
