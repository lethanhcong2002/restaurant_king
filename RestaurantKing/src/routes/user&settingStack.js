import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import UserSetting from '../screens/account/userSetting';
import ProfileScreen from '../screens/account/profileScreen';
import SettingScreen from '../screens/setting/settingScreen';
import AccountSecurityScreen from '../screens/setting/accountSecurityScreen';
import ChangePasswordScreen from '../screens/account/ChangePasswordScreen';
import TransactionHistory from '../screens/setting/transactionHistory';
import ChatBotScreen from '../screens/setting/chatBotScreen';
import ServiceRating from '../screens/setting/serviceRating';


const Stack = createNativeStackNavigator();

export default function User_SettingStack() {
    const navigation = useNavigation();
    return (
        <Stack.Navigator>
            <Stack.Screen name="User_Setting" component={UserSetting} options={{ headerShown: false }} navigation={navigation} />
            <Stack.Screen name="Profile_Screen" component={ProfileScreen} options={{ headerShown: false }} navigation={navigation} />
            <Stack.Screen name="SettingScreen" component={SettingScreen} options={{ headerShown: false }} navigation={navigation} />
            <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} options={{ headerShown: false }} navigation={navigation} />
            <Stack.Screen name="ChangePass" component={ChangePasswordScreen} options={{ headerShown: false }} navigation={navigation} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistory} options={{ headerShown: false }} navigation={navigation} />
            <Stack.Screen name="ChatBot" component={ChatBotScreen} options={{ headerShown: false }} navigation={navigation} />
            <Stack.Screen name="Review" component={ServiceRating} options={{ headerShown: false }} navigation={navigation} />
        </Stack.Navigator>
    );
}
