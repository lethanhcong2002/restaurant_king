/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { formatDate } from '../../code/formatDate';
import { getStatusText } from '../../code/formatStatus';
import { formatCurrency } from '../../code/formatMoney';

function DetailReservationScreen({ route }) {
    const { data } = route.params;
    console.log(data);

    const totalPrice = data.selectedItems?.reduce((total, item) => {
        return total + item.price * item.quantity;
    }, 0);

    return (
        <ScrollView>
            <View className="p-4">
                <Card className="p-2" elevation={5}>
                    <Card.Title
                        title="Thông tin lịch đặt / hóa đơn"
                        titleVariant="titleLarge"
                        titleStyle={{ textAlign: 'center' }}
                    />
                    <Card.Content className="mb-3">
                        <Text variant="titleMedium" className="mb-1">
                            Thông tin khách hàng:
                        </Text>
                        <View className="ml-3">
                            <Text variant="bodyMedium">
                                <Text variant="titleSmall">Tên khách hàng: </Text>
                                {data.customerName}
                            </Text>
                            <Text variant="bodyMedium">
                                <Text variant="titleSmall">Số điện thoại: </Text>
                                {data.customerPhone}
                            </Text>
                        </View>
                    </Card.Content>
                    <Card.Content>
                        <Text variant="titleMedium" className="mb-1">
                            Thông tin lịch đặt:
                        </Text>
                        <View className="ml-3">
                            <Text variant="bodyMedium">
                                <Text variant="titleSmall">Mã hóa đơn: </Text>
                                {data.code}
                            </Text>
                            <Text variant="bodyMedium">
                                <Text variant="titleSmall">Thời gian: </Text>
                                {formatDate(data.appointmentTime)}
                            </Text>
                            <Text variant="bodyMedium">
                                <Text variant="titleSmall">Số người: </Text>
                                {data.tableOccupancy}
                            </Text>
                            <Text variant="bodyMedium">
                                <Text variant="titleSmall">Trạng thái: </Text>
                                {getStatusText(data.status)}
                            </Text>
                            <Text variant="bodyMedium">
                                <Text variant="titleSmall">Ghi chú: </Text>
                                {data.notes}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                {data.selectedItems && data.selectedItems.length > 0 && (
                    <Card className="mt-4 p-2" elevation={5}>
                        <Card.Title
                            title="Danh sách món ăn"
                            titleVariant="titleLarge"
                            titleStyle={{ textAlign: 'center' }}
                        />
                        <Card.Content>
                            {data.selectedItems.map((item, index) => (
                                <View key={item.id || index} className="ml-3 mb-2">
                                    <Text variant="bodyMedium">
                                        <Text variant="titleSmall">{item.name} - </Text>
                                        {item.quantity}
                                    </Text>
                                </View>
                            ))}

                            {totalPrice > 0 && (
                                <View className="mt-4">
                                    <Text variant="bodyMedium" className="text-right">
                                        <Text variant="titleSmall">Tổng tiền: </Text>
                                        {formatCurrency(totalPrice)}
                                    </Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                )}
            </View>
        </ScrollView>
    );
}

export default DetailReservationScreen;
