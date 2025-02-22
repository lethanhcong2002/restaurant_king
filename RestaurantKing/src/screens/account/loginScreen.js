import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import React, { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { validateEmail, validatePassword } from '../../code/validateValue';
import { handleLoginWithEP } from '../../handle_code/auth';
import { useDispatch } from 'react-redux';
import { loginUser } from '../../actions/authAction';
import showToast from '../../components/toastHelper';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!validateEmail(email)) {
      showToast('error', 'Thông báo lỗi', 'Định dạng email không hợp lệ.');
      return;
    }

    if (!validatePassword(password)) {
      showToast('error', 'Thông báo lỗi', 'Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }

    try {
      setLoading(true);
      const userData = await handleLoginWithEP(email, password);
      dispatch(loginUser(userData, 'email-password'));
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
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

          <Text className="text-2xl font-bold text-gray-800 mb-5">Đăng Nhập</Text>

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
            label="Mật khẩu"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="w-full bg-transparent mb-5"
            outlineColor="#ccc"
            activeOutlineColor="#32CD32"
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            className="w-full bg-[#32CD32] mb-3"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>

          {/* <View className="mb-5 items-center">
            <GoogleSigninButton />
          </View> */}

          {/* Divider with border for fallback */}
          <View className="w-full h-1 my-4 border-t-2" />

          <TouchableOpacity onPress={() => navigation.navigate('RegisterAccount')}>
            <Text className="text-[#32CD32] mt-3 text-center">Chưa có tài khoản? Đăng ký</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPass')}>
            <Text className="text-left w-full text-blue-700 mt-5 self-start">
              Quên mật khẩu !
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
