/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Divider, Text } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { deleteNotification, markAsRead } from '../../actions/notifiAction';
import NotificationContent from '../../components/NotificationContent';

const NotificationScreen = () => {
    const notifications = useSelector(state => state.notifications.notificationList);
    const dispatch = useDispatch();

    const [expandedNotification, setExpandedNotification] = useState(null);

    const sortedNotifications = notifications.slice().sort((a, b) => {
        if (a.status !== b.status) {
            return a.status ? 1 : -1;
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const handlePress = (id) => {
        setExpandedNotification((prevState) => (prevState === id ? null : id));

        dispatch(markAsRead(id));
    };

    const handleDelete = (id) => {
        dispatch(deleteNotification(id));
    };

    const renderNotification = ({ item }) => {
        const isExpanded = expandedNotification === item.id;

        const notificationStyle = item.status ? 'text-gray-500' : 'text-black';

        return (
            <View className="mb-2">
                <TouchableOpacity
                    onPress={() => handlePress(item.id)}
                    className="p-4 bg-white rounded-lg shadow-sm"
                    style={{ position: 'relative' }}
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons
                                name={isExpanded ? 'arrow-up-drop-circle' : 'arrow-down-drop-circle'}
                                size={24}
                                color="gray"
                            />
                            <Text className={`text-lg font-semibold ml-2 ${notificationStyle}`}>
                                {item.title}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => handleDelete(item.id)}
                            style={{ position: 'absolute', right: 10 }}
                        >
                            <MaterialCommunityIcons name="delete" size={24} color="red" />
                        </TouchableOpacity>
                    </View>

                    {isExpanded && (
                        <>
                            <Divider className="mt-2" />
                            <Text className="text-base mt-2">{item.body}</Text>
                            <ScrollView className="flex-1 p-2">
                                <NotificationContent notificationData={item.data} />
                            </ScrollView>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 p-3">
            <FlatList
                data={sortedNotifications}
                keyExtractor={(item) => item.id}
                renderItem={renderNotification}
                ListEmptyComponent={<Text className="text-center text-gray-500">Không có thông báo.</Text>}
            />
        </View>
    );
};

export default NotificationScreen;
