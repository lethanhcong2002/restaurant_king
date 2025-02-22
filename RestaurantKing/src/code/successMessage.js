import { Alert } from 'react-native';

const messages = {
    updateSuccess: 'Cập nhật thành công!',
    createSuccess: 'Tạo mới thành công!',
    deleteSuccess: 'Xóa thành công!',
    saveSuccess: 'Lưu thành công!',
};


export const showSuccessMessage = (messageKey) => {
    const message = messages[messageKey] || 'Thao tác thành công!';

    Alert.alert('Thành công', message, [
        { text: 'OK' },
    ]);
};
