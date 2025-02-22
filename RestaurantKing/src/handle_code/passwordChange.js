import auth from '@react-native-firebase/auth';
import { EmailAuthProvider } from '@react-native-firebase/auth';

export const reauthenticateUser = async (email, password) => {
    const user = auth().currentUser;
    const credential = EmailAuthProvider.credential(email, password);

    try {
        await user.reauthenticateWithCredential(credential);
        return { success: true, message: 'Re-authentication successful' };
    } catch (error) {
        console.log(error.message);
        return { success: false, message: 'Re-authentication failed: ' + error.message };
    }
};

export const changePassword = async (newPassword) => {
    const user = auth().currentUser;

    try {
        await user.updatePassword(newPassword);
        return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
        return { success: false, message: 'Password update failed: ' + error.message };
    }
};
