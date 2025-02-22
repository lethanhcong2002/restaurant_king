/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform, TouchableOpacity, View } from 'react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import MenuStack from './menuStack';
import CartStack from './cartStack';
import QRScanner from '../screens/qrScanner/qrScanner';
import HomeStack from './homeStack';
import { resetStackOnTabPress } from '../code/resetStack';
import User_SettingStack from './user&settingStack';

const Tab = createBottomTabNavigator();

export default function MainBottomTab() {
    return (
        <PaperProvider>
            <Tab.Navigator
                screenOptions={{
                    tabBarShowLabel: false,
                    headerShown: false,
                    tabBarHideOnKeyboard: true,
                    tabBarActiveTintColor: '#32CD32',
                    tabBarInactiveTintColor: '#000',
                    tabBarItemStyle: {
                        // bottom: 0,
                        // right: 0,
                        // left: 0,
                        // elevation:0,
                        // height: 60,
                        background: '#fff',
                    },
                }}
                initialRouteName="Home">

                <Tab.Screen
                    name="Home"
                    component={HomeStack}
                    listeners={resetStackOnTabPress('Home', 'HomeScreen')}
                    options={({ route }) => ({
                        tabBarStyle: { display: getVisibility(route, 'Home') },
                        tabBarLabel: 'Home',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="home" size={size} color={color} />
                        ),
                    })}
                />

                <Tab.Screen
                    name="Menu"
                    component={MenuStack}
                    listeners={resetStackOnTabPress('Menu', 'List_Dishes')}
                    options={({ route }) => ({
                        tabBarStyle: { display: getVisibility(route, 'Menu') },
                        tabBarLabel: 'Menu',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="room-service" size={size} color={color} />
                        ),
                    })}
                />

                <Tab.Screen
                    name="QRScan"
                    listeners={resetStackOnTabPress('QRScan', 'QRScan')}
                    component={QRScanner}
                    options={({ route, navigation }) => ({
                        headerShown: true,
                        headerTitle: 'Quét mã QR',
                        tabBarLabel: 'QRScan',
                        tabBarStyle: { display: getVisibility(route, 'QRScan') },
                        tabBarIcon: ({ color, size }) => (
                            <View style={{
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#32CD32',
                                width: Platform.OS === 'ios' ? 50 : 60,
                                height: Platform.OS === 'ios' ? 50 : 60,
                                top: Platform.OS === 'ios' ? -10 : -20,
                                borderRadius: Platform.OS === 'ios' ? 25 : 30,
                            }}>
                                <MaterialCommunityIcons name="qrcode-scan" size={size} color={'#fff'} />
                            </View>
                        ),
                        headerLeft: () => (
                            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                                <MaterialCommunityIcons name="close" size={24}/>
                            </TouchableOpacity>
                        ),
                    })}
                />


                <Tab.Screen
                    name="Cart"
                    component={CartStack}
                    listeners={resetStackOnTabPress('Cart', 'Cart_Screen')}
                    options={({ route }) => ({
                        tabBarStyle: { display: getVisibility(route, 'Cart') },
                        tabBarLabel: 'Menu',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="cart" size={size} color={color} />
                        ),
                    })}
                />

                <Tab.Screen
                    name="Account"
                    component={User_SettingStack}
                    listeners={resetStackOnTabPress('Account', 'User_Setting')}
                    options={({ route }) => ({
                        tabBarStyle: { display: getVisibility(route, 'Account') },
                        tabBarLabel: 'Account',
                        tabBarIcon: ({ color, size }) => (
                            <MaterialCommunityIcons name="account" size={size} color={color} />
                        ),
                    })}
                />
            </Tab.Navigator>
        </PaperProvider>
    );
}

function getVisibility(route, tabName) {
    const routeName = getFocusedRouteNameFromRoute(route) ?? tabName;
    if (!routeName || routeName === tabName) {
        return 'flex';
    }

    switch (tabName) {
        case 'Home':
            return routeName === 'HomeScreen' ? 'flex' : 'none';
        case 'Menu':
            return routeName === 'List_Dishes' ? 'flex' : 'none';
        case 'QRScan':
            return 'none';
        case 'Cart':
            return routeName === 'Cart_Screen' ? 'flex' : 'none';
        case 'Account':
            return routeName === 'User_Setting' ? 'flex' : 'none';
        default:
            return 'flex';
    }
}
