/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-catch-shadow */
/* eslint-disable no-shadow */
import React, { useState } from 'react';
import { View, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { handleCreateAccount } from '../../handle_code/auth';
import { validateEmail, validatePassword, validatePhone } from '../../code/validateValue';
import showToast from '../../components/toastHelper';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const validations = [
      { condition: password !== confirmPassword, message: 'Mật khẩu không trùng khớp.' },
      { condition: !validateEmail(email), message: 'Định dạng email không chính xác.' },
      { condition: !validatePassword(password), message: 'Mật khẩu phải từ 6 ký tự trở lên.' },
      { condition: !validatePhone(phone), message: 'Định dạng số điện thoại không chính xácxác' },
      { condition: !username, message: 'Tên khách hàng không được trốngtrống' },
    ];

    const error = validations.find(v => v.condition);
    if (error) {
      showToast('error', 'Thông báo lỗi', error.message);
      return;
    }

    try {
      setLoading(true);
      const message = await handleCreateAccount(username, email, password, phone);
      if (message) {
        showToast('success', 'Thông báo', message);
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
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
          <Text className="text-2xl font-bold text-gray-800 mb-5">Tạo tài khoản</Text>

          <TextInput
            label="Họ & Tên"
            mode="outlined"
            value={username}
            onChangeText={setUsername}
            className="w-full mb-5 bg-transparent"
            outlineColor="#ccc"
            activeOutlineColor="#32CD32"
          />

          <TextInput
            label="Email"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            className="w-full mb-5 bg-transparent"
            outlineColor="#ccc"
            activeOutlineColor="#32CD32"
          />

          <TextInput
            label="Số điện thoại"
            mode="outlined"
            value={phone}
            onChangeText={setPhone}
            className="w-full mb-5 bg-transparent"
            outlineColor="#ccc"
            activeOutlineColor="#32CD32"
          />

          <TextInput
            label="Mật khẩu"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="w-full mb-5 bg-transparent"
            outlineColor="#ccc"
            activeOutlineColor="#32CD32"
          />

          <TextInput
            label="Nhập lại mật khẩu"
            mode="outlined"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            className="w-full mb-5 bg-transparent"
            outlineColor="#ccc"
            activeOutlineColor="#32CD32"
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            className="w-full bg-[#32CD32] mb-5"
            disabled={loading}
          >
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </Button>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-[#32CD32] text-center">
              Đã có tài khoản? Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
