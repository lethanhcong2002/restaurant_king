/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { TextInput, Button, Appbar } from 'react-native-paper';
import auth from '@react-native-firebase/auth';
import showToast from '../../components/toastHelper';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../actions/authAction';

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const reauthenticateUser = async () => {
        const user = auth().currentUser;
        const credential = auth.EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await user.reauthenticateWithCredential(credential);
            console.log('Re-authentication thành công');
            return true;
        } catch (error) {
            console.error('Re-authentication thất bại', error);
            Alert.alert('Re-authentication thất bại', error.message);
            return false;
        }
    };

    const changePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast('error', 'Thông báo lỗi', 'Mật khẩu không trùng khớp. Vui lòng nhập lại');
            return;
        }

        setLoading(true);

        const isReauthenticated = await reauthenticateUser();

        if (isReauthenticated) {
            const user = auth().currentUser;
            try {
                await user.updatePassword(newPassword);
                showToast('success', 'Thông báo', 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');

                await auth().signOut();
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
                dispatch(logoutUser());
            } catch (error) {
                console.error('Lỗi khi đổi mật khẩu', error);
                Alert.alert('Lỗi', error.message);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    return (
        <>
            <Appbar.Header className="bg-white border-b border-gray-200">
                <Appbar.BackAction color="#32CD32" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Thiết lập tài khoản" titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }} />
            </Appbar.Header>
            <View style={{ padding: 20 }}>
                <TextInput
                    placeholder="Nhập mật khẩu hiện tại"
                    mode="outlined"
                    activeOutlineColor="#4CAF50"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    style={{ marginBottom: 20 }} />
                <TextInput
                    placeholder="Nhập mật khẩu mới"
                    mode="outlined"
                    activeOutlineColor="#4CAF50"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    style={{ marginBottom: 20 }} />
                <TextInput
                    placeholder="Xác nhận mật khẩu mới"
                    mode="outlined"
                    activeOutlineColor="#4CAF50"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    style={{ marginBottom: 20 }} />
                <Button
                    mode="contained"
                    onPress={changePassword}
                    loading={loading}
                    disabled={loading}
                    className="w-full bg-[#32CD32] mb-5"
                >
                    Đổi mật khẩu
                </Button>
            </View>
        </>
    );
};

export default ChangePasswordScreen;
