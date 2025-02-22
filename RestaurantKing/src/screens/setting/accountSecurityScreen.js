/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, ScrollView } from 'react-native';
import { Appbar, List, Text, TouchableRipple } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const AccountSecurityScreen = ({navigation}) => {
    const user = useSelector(state => state.auth.userData);
    const maskPhoneNumber = (phone) => {
        return phone ? phone.replace(/.(?=.{2})/g, '*') : '';
    };

    const maskEmail = (email) => {
        const [name, domain] = email.split('@');
        const maskedName = name.length > 3 ? name.slice(0, 2) + '****' : '***';
        return `${maskedName}@${domain}`;
    };
    return (
        <View className="flex-1 bg-gray-100">
            <Appbar.Header className="bg-white border-b border-gray-300">
                <Appbar.BackAction color="#32CD32" onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title="Tài khoản & Bảo mật"
                    titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }}
                />
            </Appbar.Header>
            <ScrollView className="flex-1 py-2">
                <TouchableRipple onPress={() => navigation.navigate('Profile_Screen')} className="bg-white border-b border-gray-300">
                    <List.Item
                        title="Hồ sơ của tôi"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                        className="flex-row justify-between items-center"
                    />
                </TouchableRipple>
                <TouchableRipple onPress={() => { }} className="bg-white border-b border-gray-300">
                    <View className="flex-row justify-between items-center p-4">
                        <Text className="text-gray-700">Tên người dùng</Text>
                        <Text className="text-gray-600">{user?.customerName || 'Không xác định'}</Text>
                    </View>
                </TouchableRipple>

                <TouchableRipple onPress={() => { }} className="bg-white border-b border-gray-300">
                    <View className="flex-row justify-between items-center p-4">
                        <Text className="text-gray-700">Điện thoại</Text>
                        <Text className="text-gray-600">{maskPhoneNumber(user?.phoneNumber || '')}</Text>
                    </View>
                </TouchableRipple>

                <TouchableRipple onPress={() => { }} className="bg-white border-b border-gray-300">
                    <View className="flex-row justify-between items-center p-4">
                        <Text className="text-gray-700">Email nhận hóa đơn</Text>
                        <Text className="text-gray-600">{maskEmail(user?.email || '')}</Text>
                    </View>
                </TouchableRipple>
                <TouchableRipple onPress={() => { }} className="bg-white border-b border-gray-300">
                    <List.Item
                        title="Tài khoản mạng xã hội"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                        className="flex-row justify-between items-center"
                    />
                </TouchableRipple>
                <TouchableRipple onPress={() => navigation.navigate('ChangePass')} className="bg-white border-b border-gray-300">
                    <List.Item
                        title="Đổi mật khẩu"
                        right={() => <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
                        className="flex-row justify-between items-center"
                    />
                </TouchableRipple>
            </ScrollView>
        </View>
    );
};

export default AccountSecurityScreen;
