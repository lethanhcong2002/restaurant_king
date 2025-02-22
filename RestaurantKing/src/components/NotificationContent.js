import React from 'react';
import { View, Text, Button } from 'react-native';

const NotificationContent = ({ notificationData }) => {
    const { type } = notificationData || {};

    const renderNotificationContent = () => {
        switch (type) {
            case 'accepted':
                return (
                    <View className="p-4 mb-4 bg-gray-100 rounded-lg shadow-md">
                        <Text className="text-xl font-bold mb-2">Đặt bàn đã được chấp nhận</Text>
                        {notificationData.customerName && (
                            <Text className="text-base mb-2">
                                Xin chào {notificationData.customerName},
                            </Text>
                        )}
                        {notificationData.code && (
                            <Text className="text-base mb-2">
                                Yêu cầu đặt bàn của bạn với mã {notificationData.code} đã được xác nhận.
                            </Text>
                        )}
                        {notificationData.appointmentDate && (
                            <Text className="text-base mb-4">
                                Vui lòng đến vào {new Date(notificationData.appointmentDate).toLocaleString()}.
                            </Text>
                        )}
                    </View>
                );

            case 'cancelled':
                return (
                    <View className="p-4 mb-4 bg-gray-100 rounded-lg shadow-md">
                        <Text className="text-xl font-bold mb-2">Yêu cầu đặt bàn bị hủy</Text>
                        {notificationData.customerName && (
                            <Text className="text-base mb-2">
                                Xin chào {notificationData.customerName},
                            </Text>
                        )}
                        {notificationData.code && (
                            <Text className="text-base mb-2">
                                Rất tiếc, yêu cầu đặt bàn của bạn với mã {notificationData.code} đã bị hủy.
                            </Text>
                        )}
                        <Text className="text-base mb-4">
                            Xin vui lòng liên hệ với chúng tôi để biết thêm chi tiết.
                        </Text>
                    </View>
                );

            case 'all':
                return (
                    <View className="p-4 mb-4 bg-gray-200 rounded-lg shadow-md">
                        {notificationData?.description && (
                            <Text className="text-base text-gray-700">
                                {notificationData.description}
                            </Text>
                        )}
                    </View>

                )
            default:
                return (
                    <View className="p-4 mb-4 bg-gray-100 rounded-lg shadow-md">
                        <Text className="text-xl font-bold mb-2">Thông báo không xác định</Text>
                        <Text className="text-base">
                            Chúng tôi không thể xác nhận loại thông báo này.
                        </Text>
                    </View>
                );
        }
    };

    return <View>{renderNotificationContent()}</View>;
};

export default NotificationContent;
