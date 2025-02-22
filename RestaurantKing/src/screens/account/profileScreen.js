/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Button, Appbar, Dialog, Portal, Paragraph } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserInfo } from '../../handle_code/auth';
import { loginUser } from '../../actions/authAction';
import showToast from '../../components/toastHelper';

const ProfileScreen = ({navigation}) => {
    const user = useSelector(state => state.auth.userData);
    const dispatch = useDispatch();
    const [name, setName] = useState(user.customerName || '');
    const [email] = useState(user.email || '');
    const [phone, setPhone] = useState(user.phoneNumber || '');

    const [tempName, setTempName] = useState(name);
    const [tempPhone, setTempPhone] = useState(phone);

    const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
        setName(tempName);
        setPhone(tempPhone);

        const data = await updateUserInfo(user.uid, { customerName: tempName, customerPhone: tempPhone });
        if (data) {
            const combinedUserData = {
                uid: user.uid,
                customerName: data.customerName || user.displayName || '',
                email: data.customerEmail || user.email || '',
                phoneNumber: data.customerPhone || '',
            };
            showToast('success', 'Thông báo', 'Cập nhật thành công.');
            setIsEditing(false);
            dispatch(loginUser(combinedUserData, 'email-password'));
        }
    };

    const handleCancel = () => {
        setTempName(name);
        setTempPhone(phone);
        setIsEditing(false);
    };

    return (
        <>
            <Appbar.Header className="bg-white">
                <Appbar.BackAction color="#32CD32" onPress={() => navigation.goBack()} />
                <Appbar.Content
                    title="Thông tin cá nhân"
                    titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }}
                />
                <Appbar.Action
                    icon={isEditing ? 'content-save' : 'pencil'}
                    onPress={isEditing ? handleSave : () => setIsEditing(true)}
                />
            </Appbar.Header>

            <ScrollView>
                <View className="w-full">
                    <TextInput
                        value={tempName}
                        onChangeText={setTempName}
                        editable={isEditing}
                        className="border-b border-gray-300 p-2 text-right"
                        placeholder="Nhập họ và tên"
                    />
                </View>

                <View className="w-full">
                    <TextInput
                        value={email}
                        editable={false}
                        keyboardType="email-address"
                        className="border-b border-gray-300 p-2 text-right"
                        placeholder="Email"
                    />
                </View>

                <View className="mb-5 w-full">
                    <TextInput
                        value={tempPhone}
                        onChangeText={setTempPhone}
                        editable={isEditing}
                        keyboardType="phone-pad"
                        className="border-b border-gray-300 p-2 text-right"
                        placeholder="Nhập số điện thoại"
                    />
                </View>

                {isEditing && (
                    <View className="flex-row justify-center space-x-3 mx-5">
                        <Button
                            mode="outlined"
                            onPress={handleSave}
                            style={{ borderColor: '#32CD32', flex: 1 }}
                            textColor="#32CD32"
                        >
                            Lưu
                        </Button>

                        <Button
                            mode="outlined"
                            onPress={handleCancel}
                            style={{ borderColor: '#FF6347', flex: 1 }}
                            textColor="#FF6347"
                        >
                            Hủy
                        </Button>
                    </View>
                )}
            </ScrollView>
        </>
    );
};

export default ProfileScreen;
