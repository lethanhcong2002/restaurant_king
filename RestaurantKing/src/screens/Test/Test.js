/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Button, Card, IconButton, Menu } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { getTableByGeneratedId } from '../../handle_code/table';
import { getAllDishes } from '../../handle_code/dishes';
import { formatCurrency } from '../../code/formatMoney';
import { resetStack } from '../../code/resetStack';
import { updateTable_Dishes } from '../../handle_code/invoice';
import { getCategoryDishes, getPriceRange } from '../../code/formatStatus';

const OrderScreen = ({ navigation }) => {

    const data = useSelector(state => state.qrData.qrData);
    const [selectedDishes, setSelectedDishes] = useState([]);
    const [tableData, setTableData] = useState(null);
    const [dishes, setDishes] = useState([]);

    const [category, setCategory] = useState(null); // Bộ lọc danh mục
    const [priceRange, setPriceRange] = useState(''); // Bộ lọc khoảng giá

    const [menuVisible, setMenuVisible] = useState(false); // Trạng thái menu bộ lọc danh mục
    const [priceMenuVisible, setPriceMenuVisible] = useState(false); // Trạng thái menu bộ lọc giá

    const fetchDishes = () => {
        getAllDishes((fetchedDishes) => {
            setDishes(fetchedDishes);
        });
    };

    const fetchTableData = async () => {
        if (data && data.tablekey) {
            const result = await getTableByGeneratedId(data.tablekey);
            if (result.error) {
                Alert.alert('thông báo bàn đã được sử dụng');
                resetStack(navigation, 'Home', 'Home_Screen');
            } else {
                setTableData(result);
                console.log(result);
            }
        }
    };

    useEffect(() => {
        fetchDishes();
        fetchTableData();
    }, []);

    const handleSelectDish = (dish) => {
        setSelectedDishes((prev) => {
            const existingDish = prev.find((item) => item.id === dish.id);
            if (existingDish) {
                return prev.map((item) =>
                    item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prev, { ...dish, quantity: 1 }];
            }
        });
    };

    const handleRemoveDish = (id) => {
        setSelectedDishes((prev) => prev.filter((dish) => dish.id !== id));
    };

    const handleIncreaseQuantity = (id) => {
        setSelectedDishes((prev) =>
            prev.map((dish) => (dish.id === id ? { ...dish, quantity: dish.quantity + 1 } : dish))
        );
    };

    const handleDecreaseQuantity = (id) => {
        setSelectedDishes((prev) =>
            prev.map((dish) =>
                dish.id === id
                    ? { ...dish, quantity: dish.quantity > 1 ? dish.quantity - 1 : dish.quantity }
                    : dish
            )
        );
    };

    const handleConfirm = () => {
        if (selectedDishes.length === 0) {
            Alert.alert('No dishes selected', 'Please select at least one dish to confirm your order.');
            return;
        }

        const dataConfirm = {
            orderId: data.id,
            selectedTable: tableData.id,
            selectedDishes: selectedDishes.map((dish) => ({
                id: dish.id,
                name: dish.name,
                price: dish.price,
                quantity: dish.quantity,
            })),
        };

        updateTable_Dishes(dataConfirm)
            .then(() => {
                console.log('Table and invoice updated successfully with selected dishes');
                resetStack(navigation, 'Home', 'HomeScreen');
            })
            .catch((error) => {
                console.error(error.message);
            });
    };

    const renderItem = ({ item }) => (
        <Card className="mb-4 rounded-xl bg-white shadow-lg">
            <View className="flex-row p-4">
                <Image
                    source={{ uri: Array.isArray(item.imageUrls) ? item.imageUrls[0] : item.imageUrls }}
                    className="w-20 h-full rounded-lg mr-4"
                    resizeMode="contain"
                />
                <View className="flex-1 justify-center">
                    <Text className="text-lg font-bold">{item.name}</Text>
                    {/* <Text className="text-sm text-gray-600 my-2">{item.notes}</Text> */}
                    <Text className="text-md font-semibold">{formatCurrency(item.price)}</Text>
                    <TouchableOpacity onPress={() => handleSelectDish(item)} className="mt-2 bg-green-500 p-2 rounded-lg items-center">
                        <Text className="text-white font-bold">Thêm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>

    );

    return (
        <View className="flex-1 p-4 bg-gray-100">
            <View className="p-4 bg-white mb-4 rounded-xl shadow-md">
                <Text className="text-xl font-bold mb-2">Thông tin hóa đơn</Text>
                <Text className="text-md mb-2">Mã hóa đơn: {data ? data.code : ''}</Text>
                <Text className="text-md mb-2">Khách hàng: {data ? data.customerName : ''}</Text>
                <Text className="text-md">Bàn: {tableData ? tableData.tableName : 'Loading...'}</Text>
            </View>

            <View className="flex-1">
                <Text className="text-xl font-bold mb-1">Danh sách món ăn</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10 }} className="mb-2">
                    <View style={{ flex: 5, marginRight: 5 }}>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setMenuVisible(true)} textColor="#808080">
                                    {category !== null ? getCategoryDishes(category) : 'Danh mục'}
                                </Button>
                            }>
                            <Menu.Item onPress={() => { setCategory(0); setMenuVisible(false); }} title="Khai vị" />
                            <Menu.Item onPress={() => { setCategory(1); setMenuVisible(false); }} title="Món chính" />
                            <Menu.Item onPress={() => { setCategory(2); setMenuVisible(false); }} title="Tráng miệng" />
                            <Menu.Item onPress={() => { setCategory(3); setMenuVisible(false); }} title="Nước" />
                        </Menu>
                    </View>

                    <View style={{ flex: 5, marginRight: 5 }}>
                        <Menu
                            visible={priceMenuVisible}
                            onDismiss={() => setPriceMenuVisible(false)}
                            anchor={
                                <Button mode="outlined" onPress={() => setPriceMenuVisible(true)} textColor="#808080">
                                    {priceRange ? getPriceRange(priceRange) : 'Khoảng giá'}
                                </Button>
                            }>
                            <Menu.Item onPress={() => { setPriceRange('low'); setPriceMenuVisible(false); }} title="Dưới 50k" />
                            <Menu.Item onPress={() => { setPriceRange('medium'); setPriceMenuVisible(false); }} title="50k - 100k" />
                            <Menu.Item onPress={() => { setPriceRange('high'); setPriceMenuVisible(false); }} title="Trên 100k" />
                        </Menu>
                    </View>

                    <View style={{ flex: 2, justifyContent: 'center', alignItems: 'center' }}>
                        <IconButton
                            icon="close-circle-outline"
                            size={30}
                            onPress={() => {
                                setCategory(null);
                                setPriceRange('');
                            }}
                            iconColor="#f44336"
                            style={{
                                alignSelf: 'center',
                                marginTop: 'auto',
                                marginBottom: 'auto',
                            }}
                        />
                    </View>
                </View>
                <FlatList
                    data={dishes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            <View className="max-h-[250px] mt-4 px-4 py-2 bg-white rounded-xl shadow-lg">
                <Text className="text-xl font-bold mb-2">Đơn hàng</Text>
                <ScrollView>
                    {selectedDishes.map((dish) => (
                        <View key={dish.id} className="flex-row justify-between items-center">
                            <Text className="text-md text-center flex-1">{dish.name}</Text>
                            <Text className="text-md text-center flex-1">{dish.quantity}</Text>
                            <View className="flex-row items-center space-x-2">
                                <TouchableOpacity onPress={() => handleIncreaseQuantity(dish.id)} className="bg-green-500 p-2 rounded-lg">
                                    <Text className="text-white font-bold">+</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDecreaseQuantity(dish.id)} className="bg-orange-500 p-2 rounded-lg">
                                    <Text className="text-white font-bold">-</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleRemoveDish(dish.id)} className="bg-red-500 p-2 rounded-lg">
                                    <Text className="text-white font-bold">Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
                <View className="flex-row justify-between items-center mt-4">
                    <Text className="text-md font-semibold">
                        Tổng: {formatCurrency(selectedDishes.reduce((sum, dish) => sum + dish.price * dish.quantity, 0))}
                    </Text>
                    <TouchableOpacity className="bg-blue-500 p-2 rounded-lg" onPress={handleConfirm}>
                        <Text className="text-white font-bold">Xác nhận</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default OrderScreen;
