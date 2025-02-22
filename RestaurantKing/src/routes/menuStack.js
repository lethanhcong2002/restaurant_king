import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MenuScreen from '../screens/menu/menuScreen';
import DetailDishesScreen from '../screens/menu/detailDishesScreen';

const Stack = createNativeStackNavigator();

function MenuStack() {
    const navigation = useNavigation();

    return (
        <Stack.Navigator initialRouteName="List_Dishes">
            <Stack.Screen
                name="List_Dishes"
                component={MenuScreen}
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
        </Stack.Navigator>
    );
}

export default MenuStack;
