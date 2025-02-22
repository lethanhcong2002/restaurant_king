import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/account/loginScreen';
import { useNavigation } from '@react-navigation/native';
import RegisterScreen from '../screens/account/registerScreen';
import ForgotPasswordScreen from '../screens/account/forgotPassScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    const navigation = useNavigation();
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="LoginAccount" component={LoginScreen} navigation={navigation} />
            <Stack.Screen name="RegisterAccount" component={RegisterScreen} navigation={navigation} />
            <Stack.Screen name="ForgotPass" component={ForgotPasswordScreen} navigation={navigation} />
        </Stack.Navigator>
    );
}
