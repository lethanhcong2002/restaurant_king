import React from 'react';
import { View, Text } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { COLORS } from '../code/color';

const LoadingComponent = ({ message = 'Loading...' }) => {
    return (
        <View>
            <ActivityIndicator animating={true} size="large" color={COLORS.primary}/>
            <Text className="mt-2 text-lg">{message}</Text>
        </View>
    );
};

export default LoadingComponent;
