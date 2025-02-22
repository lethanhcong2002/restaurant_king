/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Appbar, Button, List, Text, TouchableRipple } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { handleLogoutAccount } from '../../handle_code/auth';
import { logoutUser } from '../../actions/authAction';

const SettingScreen = ({navigation}) => {
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
        <View className="flex-1 bg-white">
            <Appbar.Header className="bg-white border-b border-gray-200">
                <Appbar.BackAction color="#32CD32" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Thiết lập tài khoản" titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }} />
            </Appbar.Header>


            <ScrollView scrollEnabled>
                <View className="bg-gray-100 p-2">
                    <Text className="text-gray-500">Tài khoản</Text>
                </View>

                <TouchableRipple onPress={() => navigation.navigate('AccountSecurity')}>
                    <List.Item
                        title="Tài khoản & Bảo mật"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <View className="bg-gray-100 p-2">
                    <Text className="text-gray-500">Cài đặt</Text>
                </View>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Cài đặt Chat"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Cài đặt Thông báo"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Cài đặt riêng tư"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Ngôn ngữ / Language"
                        description="Tiếng Việt"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <View className="bg-gray-100 p-2">
                    <Text className="text-gray-500">Hỗ trợ</Text>
                </View>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Trung tâm hỗ trợ"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Tiêu chuẩn cộng đồng"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Điều Khoản Restaurant King"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Hài lòng với Restaurant King? Hãy đánh giá ..."
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Giới thiệu"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <TouchableRipple onPress={() => { }}>
                    <List.Item
                        title="Yêu cầu xóa tài khoản"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                    />
                </TouchableRipple>

                <View className="bg-gray-100 p-2">
                    <View className="p-5">
                        <Button
                            mode="outlined"
                            onPress={handleLogout}
                            style={{ borderColor: '#32CD32' }}
                            textColor="#32CD32"
                        >
                            Đăng xuất
                        </Button>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default SettingScreen;
