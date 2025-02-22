// ToastHelper.js

import Toast from 'react-native-toast-message';

const showToast = (type, title, message) => {
    Toast.show({
        type: type,
        position: 'top',
        text1: title,
        text2: message,
        visibilityTime: 3000,
        autoHide: true,
    });
};

export default showToast;
