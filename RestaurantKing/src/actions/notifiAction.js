const addNotification = (notification) => {
    return {
        type: 'ADD_NOTIFICATION',
        payload: {
            id: Date.now().toString(),
            title: notification.title,
            body: notification.body,
            data: notification.data,
            status: false,
            timestamp: Date.now(),
        },
    };
};

const deleteNotification = (id) => ({
    type: 'DELETE_NOTIFICATION',
    payload: id,
});

const markAsRead = (id) => ({
    type: 'MARK_AS_READ',
    payload: id,
});

export {addNotification, deleteNotification, markAsRead};
