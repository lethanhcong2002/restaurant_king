import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import HomeScreen from '../screens/home/homeScreens';
import DetailDishesScreen from '../screens/menu/detailDishesScreen';
import NotificationScreen from '../screens/notification/notificationScreen';

const Stack = createNativeStackNavigator();

function HomeStack() {
    const navigation = useNavigation();

    return (
        <Stack.Navigator initialRouteName="HomeScreen">
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                navigation={navigation}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="Detail_Dishes"
                component={DetailDishesScreen}
                options={{
                    title: '',
                }}
                navigation={navigation}
            />

            <Stack.Screen
                name="NotificationScreen"
                component={NotificationScreen}
                options={{
                    title: '',
                }}
                navigation={navigation}
            />
        </Stack.Navigator>
    );
}

export default HomeStack;