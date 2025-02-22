/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ScrollView} from 'react-native';
import { Button, Card, IconButton, Menu } from 'react-native-paper';
import { getTableById } from '../../handle_code/table';
import { getAllDishes } from '../../handle_code/dishes';
import { formatCurrency } from '../../code/formatMoney';
import { resetStack } from '../../code/resetStack';
import { updateOrderAgain } from '../../handle_code/invoice';
import { getCategoryDishes, getPriceRange } from '../../code/formatStatus';
import showToast from '../../components/toastHelper';

const OrderAgainScreen = ({ navigation, route }) => {
    const { data } = route.params || {};
    const [selectedDishes, setSelectedDishes] = useState(data?.selectedItems || []);
    const [previousDishes, setPreviousDishes] = useState(data?.selectedItems || []);
    const [tableData, setTableData] = useState(null);
    const [dishes, setDishes] = useState([]);
    const [category, setCategory] = useState(null);
    const [priceRange, setPriceRange] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);
    const [priceMenuVisible, setPriceMenuVisible] = useState(false);

    const fetchDishes = () => {
        getAllDishes((fetchedDishes) => {
            setDishes(fetchedDishes);
        });
    };

    const fetchTableData = async () => {
        if (data && data.selectedTable) {
            const result = await getTableById(data.selectedTable);
            if (result.error) {
                showToast('error', 'Thông báo lỗi', 'Không tìm thấy bàn.');
                return;
            }
            setTableData(result);
        }
    };

    useEffect(() => {
        if (data) {
            fetchDishes();
            fetchTableData();
            setSelectedDishes(data.selectedItems || []);
            setPreviousDishes(data.selectedItems || []);
        }
    }, [data]);

    const handleSelectDish = (dish) => {
        setSelectedDishes((prev) => {
            const existingDish = prev.find((item) => item.itemId === dish.id);

            if (existingDish) {
                return prev.map((item) =>
                    item.itemId === dish.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prev, { ...dish, itemId: dish.id, quantity: 1 }];
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
            showToast('error', 'Thông báo lỗi', 'Vui lòng chọn ít nhất một món ăn để xác nhận đơn hàng.');

            return;
        }

        const dataConfirm = {
            orderId: data.id,
            selectedDishes: selectedDishes.map((dish) => {
                const previousDish = previousDishes.find((d) => d.itemId === dish.itemId);
                let change = 'added';

                if (previousDish) {
                    if (dish.quantity > previousDish.quantity) {
                        change = `increased by ${dish.quantity - previousDish.quantity}`;
                    } else if (dish.quantity < previousDish.quantity) {
                        change = `decreased by ${previousDish.quantity - dish.quantity}`;
                    } else if (dish.quantity === 0) {
                        change = 'removed';
                    } else {
                        change = 'added';
                    }
                }

                return {
                    id: dish.id,
                    itemId: dish.itemId,
                    name: dish.name,
                    price: dish.price,
                    quantity: dish.quantity,
                    change,
                };
            }).concat(
                previousDishes.filter(d => !selectedDishes.some(dish => dish.itemId === d.itemId))
                    .map(d => ({
                        id: d.id,
                        itemId: d.itemId,
                        change: 'removed',
                    }))
            ),
        };

        setPreviousDishes(selectedDishes);

        updateOrderAgain(dataConfirm)
            .then(() => {
                console.log('Đơn hàng đã được cập nhật');
                resetStack(navigation, 'Home', 'HomeScreen');
            })
            .catch((error) => {
                console.error(error.message);
                showToast('error', 'Thông báo lỗi', 'Không thể cập nhật đơn hàng.');
            });
    };

    const filteredDishes = useMemo(() => {
        return dishes
            .filter(item => category !== null ? item.category === category : true)
            .filter(item => {
                if (priceRange === 'low') { return item.price < 50000; }
                if (priceRange === 'medium') { return item.price >= 50000 && item.price <= 100000; }
                if (priceRange === 'high') { return item.price > 100000; }
                return true;
            });
    }, [dishes, category, priceRange]);

    const renderItem = ({ item }) => (
        <Card className="mb-4 rounded-xl bg-white shadow-lg">
            <View className="flex-row p-4">
                <Image
                    source={{ uri: Array.isArray(item.imageUrls) ? item.imageUrls[0] : item.imageUrls }}
                    className="w-20 h-20 rounded-lg mr-4"
                    resizeMode="contain"
                />
                <View className="flex-1 justify-center">
                    <Text className="text-lg font-bold">{item.name}</Text>
                    {/* <Text className="text-sm text-gray-600 my-2">{item.notes}</Text> */}
                    <Text className="text-md font-semibold">{formatCurrency(item.price)}</Text>
                    <TouchableOpacity
                        onPress={() => handleSelectDish(item)}
                        className="mt-2 bg-green-500 p-2 rounded-lg items-center"
                    >
                        <Text className="text-white font-bold">Thêm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    return (
        <View className="flex-1 p-2 bg-gray-100">
            <View className="p-2 bg-white mb-2 rounded-xl shadow-md">
                <Text className="text-xl font-bold mb-2">Thông tin hóa đơn</Text>
                <Text className="text-md mb-2">Mã hóa đơn: {data ? data.code : ''}</Text>
                <Text className="text-md mb-2">Khách hàng: {data ? data.customerName : ''}</Text>
                <Text className="text-md">Bàn: {tableData ? tableData.tableName : 'Loading...'}</Text>
            </View>

            <View className="flex-1">
                <Text className="text-xl font-bold mb-2">Danh sách món ăn</Text>
                <View style={{ flexDirection: 'row', marginBottom: 8, justifyContent: 'space-between' }} className="mb-2">
                    <View style={{ flex: 5, marginRight: 8 }}>
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

                    <View style={{ flex: 5, marginRight: 8 }}>
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
                    data={filteredDishes}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={<Text className="text-base text-gray-500 text-center p-5">Vui lòng chờ</Text>}
                />
            </View>

            <View className="max-h-[200px] mt-4 px-2 py-2 bg-white rounded-xl shadow-lg">
                <Text className="text-xl font-bold mb-2">Đơn hàng</Text>
                <ScrollView>
                    {selectedDishes.map((dish, index) => (
                        <View key={`${dish.id}-${dish.quantity}-${index}`} className="flex-row justify-between items-center mb-3">
                            <Text className="text-md text-center flex-1">{dish.name}</Text>
                            <Text className="text-md text-center flex-1">{dish.quantity}</Text>
                            <View className="flex-row items-center space-x-2">
                                <IconButton
                                    icon="minus-circle-outline"
                                    onPress={() => handleDecreaseQuantity(dish.id)}
                                />
                                <IconButton
                                    icon="plus-circle-outline"
                                    onPress={() => handleIncreaseQuantity(dish.id)}
                                />
                                <TouchableOpacity onPress={() => handleRemoveDish(dish.id)}>
                                    <Text style={{ color: 'red', fontSize: 16 }}>Xóa</Text>
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

export default OrderAgainScreen;
