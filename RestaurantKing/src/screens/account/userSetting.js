/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Appbar, Button, Avatar, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { handleLogoutAccount } from '../../handle_code/auth';
import { logoutUser } from '../../actions/authAction';

const UserSetting = ({ navigation }) => {
    const user = useSelector(state => state.auth.userData);
    const loginType = useSelector(state => state.auth.typeLogin);
    const dispatch = useDispatch();

    const handleLogout = async () => {
        try {
            if (loginType === 'google') {
                await GoogleSignin.revokeAccess();
            }

            await handleLogoutAccount(user.uid);

            dispatch(logoutUser());

            console.log('Stack đã được reset và user đã logout.');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <View className="flex-1">
            <Appbar.Header className="bg-[#32CD32]">
                <Appbar.Content
                    title={user ? user.customerName : 'đợi chút'}
                    titleStyle={{ color: 'white' }}
                    onPress={() => navigation.navigate('Profile_Screen')}
                />
                <Appbar.Action icon="cog" onPress={() => navigation.navigate('SettingScreen')} color="white" />
                <Appbar.Action icon="cart" onPress={() => navigation.navigate('Cart')} color="white" />
            </Appbar.Header>

            {/* Scrollable content */}
            <ScrollView className="bg-white p-4">
                <View className="mb-5">
                    <Text variant="titleMedium" className="mb-3.5">Lịch sử và Thống kê</Text>
                    <TouchableOpacity className="mb-3" onPress={() => navigation.navigate('TransactionHistory')}>
                        <Text variant="bodyMedium" className="text-gray-500">Lịch sử ăn uống</Text>
                    </TouchableOpacity>
                    <View className="mb-3">
                        <Text variant="bodyMedium" className="text-gray-500">Thống kê</Text>
                    </View>
                </View>

                <Divider className="mb-5" />

                <View className="mb-5">
                    <Text variant="titleMedium" className="mb-3.5">Trung tâm hỗ trợ</Text>
                    <TouchableOpacity className="mb-3">
                        <Text variant="bodyMedium" className="text-gray-500">Trung tâm hỗ trợ</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="mb-3" onPress={() => navigation.navigate('ChatBot')}>
                        <Text variant="bodyMedium" className="text-gray-500">Trò chuyện với RK</Text>
                    </TouchableOpacity>
                </View>

                <Divider className="mb-5" />

                <View className="mb-5">
                    <Text variant="titleMedium" className="mb-3.5">Khám phá và Giới thiệu</Text>
                    <View className="mb-3">
                        <Text variant="bodyMedium" className="text-gray-500">Khám phá Restaurant King</Text>
                    </View>
                    <View className="mb-3">
                        <Text variant="bodyMedium" className="text-gray-500">Giới thiệu</Text>
                    </View>
                </View>

                <Divider className="mb-5" />

                <View className="mb-5">
                    <Button
                        mode="outlined"
                        onPress={handleLogout}
                        style={{ borderColor: '#32CD32' }}
                        textColor="#32CD32"
                    >
                        Đăng xuất
                    </Button>
                </View>
            </ScrollView>
        </View>
    );
};

export default UserSetting;
