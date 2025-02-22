/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { validateEmail } from '../../code/validateValue';
import { sendPassResetEmail } from '../../handle_code/auth';
import showToast from '../../components/toastHelper';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgotPasswordPress = async () => {
        if (!validateEmail(email)) {
            showToast('error', 'Thông báo lỗi', 'Định dạng email không hợp lệ.');
            return;
        }

        setLoading(true);
        const result = await sendPassResetEmail(email);

        showToast(
            result.success ? "success" : "error",
            result.success ? "Thông báo" : "Lỗi",
            result.message
        );

        if (result.success) {
            navigation.goBack();
        }

        setLoading(false);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
            <ScrollView contentContainerStyle={{ flex: 1 }} keyboardShouldPersistTaps="handled">
                <View className="flex-1 bg-white justify-center items-center p-5">
                    <Text className="text-[#32CD32] text-4xl font-bold mb-10">Restaurant King</Text>

                    <Text className="text-2xl font-bold text-gray-800 mb-5">Quên Mật Khẩu</Text>
                    <TextInput
                        label="Email"
                        mode="outlined"
                        value={email}
                        onChangeText={setEmail}
                        className="w-full mb-5 bg-transparent"
                        outlineColor="#ccc"
                        activeOutlineColor="#32CD32"
                    />
                    <Button
                        mode="contained"
                        onPress={handleForgotPasswordPress}
                        className="w-full bg-[#32CD32] mb-2"
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </Button>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-[#32CD32] mt-5 text-center">Quay lại đăng nhập</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;
