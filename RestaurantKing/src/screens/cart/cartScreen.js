/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import CustomDotCart from '../../components/customDotCart';
import { COLORS } from '../../code/color';
import { getStatusColor, getStatusText } from '../../code/formatStatus';
import { getInvoices } from '../../handle_code/invoice';
import { useSelector } from 'react-redux';
import { formatDate } from '../../code/formatDate';

function CartScreen({ navigation }) {
    const user = useSelector(state => state.auth.userData);

    const [bodyData, setBodyData] = useState([]);

    useEffect(() => {
        const fetchData = () => {
            try {
                const unsubscribe = getInvoices(user.uid, (data) => {
                    setBodyData(data);
                });

                return unsubscribe;
            } catch (error) {
                console.error('Error fetching invoices:', error);
            }
        };

        fetchData();

    }, [user.uid]);

    return (
        <View className="flex-1 p-4">
            <View className="mb-4">
                <Button
                    icon="plus"
                    mode="contained"
                    onPress={() => navigation.navigate('Reservation')}
                    className="bg-[#32CD32]">
                    Đặt bàn trước
                </Button>
            </View>

            <FlatList
                data={bodyData}
                contentContainerStyle={{ paddingBottom: 12 }}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <Card className="mb-4" mode="contained" style={{ backgroundColor: COLORS.secondary }}>
                        <Card.Title
                            title={
                                <View className="flex-row items-center">
                                    <Text className="mr-2">Hóa đơn:</Text>
                                    <Text className="text-lg font-bold" style={{ color: COLORS.important }}>{item.code}</Text>
                                </View>
                            }
                            subtitle={formatDate(item.appointmentTime)}
                            right={() => <CustomDotCart navigation={navigation} reservationData={item} />}
                            style={{ marginBottom: 5 }}
                        />
                        <Card.Content>
                            <Text
                                style={{
                                    backgroundColor: getStatusColor(item.status),
                                    padding: 4,
                                    borderRadius: 4,
                                    color: COLORS.text_white,
                                    textAlign: 'center',
                                    fontWeight: 'bold',
                                }}
                            >
                                {getStatusText(item.status)}
                            </Text>
                        </Card.Content>
                    </Card>
                )}
                ListEmptyComponent={<Text className="text-base text-gray-500 text-center p-5">Không có hóa đơn.</Text>}
            />
        </View>
    );
}

export default CartScreen;
