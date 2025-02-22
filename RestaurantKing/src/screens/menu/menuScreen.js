/* eslint-disable react-native/no-inline-styles */
import React, { useState, useMemo, useEffect } from 'react';
import { FlatList, ImageBackground, TextInput, TouchableOpacity, View } from 'react-native';
import { Appbar, IconButton, Text, Menu, Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { getData } from '../../actions/dataAction';
import { getAllDishes } from '../../handle_code/dishes';
import LoadingComponent from '../../components/loadingComponent';
import { getCategoryDishes, getPriceRange } from '../../code/formatStatus';

const MenuScreen = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();
    const [bodyData, setBodyData] = useState([]);
    const [category, setCategory] = useState(null); // Bộ lọc danh mục
    const [priceRange, setPriceRange] = useState(''); // Bộ lọc khoảng giá

    const [menuVisible, setMenuVisible] = useState(false); // Trạng thái menu bộ lọc danh mục
    const [priceMenuVisible, setPriceMenuVisible] = useState(false); // Trạng thái menu bộ lọc giá

    useEffect(() => {
        const fetchData = () => {
            getAllDishes((dishes) => {
                setBodyData(dishes);
            });
        };

        fetchData();
    }, []);

    const handleDetailDishes = (item) => {
        navigation.navigate('Detail_Dishes');
        dispatch(getData(item));
    };

    const filteredData = useMemo(() => {
        return bodyData
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .filter(item => (category !== null ? item.category === category : true)) // Kiểm tra category là null hoặc có giá trị
            .filter(item => {
                if (priceRange === 'low') {return item.price < 50000;}
                if (priceRange === 'medium') {return item.price >= 50000 && item.price <= 100000;}
                if (priceRange === 'high') {return item.price > 100000;}
                return true;
            });
    }, [searchQuery, bodyData, category, priceRange]);

    return (
        <>
            <Appbar.Header style={{ backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 3 }}>
                <TextInput
                    placeholder="Tìm kiếm"
                    value={searchQuery}
                    onChangeText={(query) => setSearchQuery(query)}
                    style={{ flex: 1, height: 40, borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#f0f0f0', marginRight: 10, color: 'black' }}
                    placeholderTextColor="#888"
                />
                <View className="flex-row space-x-2">
                    <IconButton
                        icon="cart"
                        color="#004d00"
                        size={24}
                        onPress={() => navigation.navigate('Cart')}
                    />
                    <IconButton
                        icon="account"
                        color="#004d00"
                        size={24}
                        onPress={() => navigation.navigate('Account')}
                    />
                </View>
            </Appbar.Header>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 10, marginTop: 10 }}>
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
                            setSearchQuery('');
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
                style={{ marginTop: 10 }}
                data={filteredData}
                numColumns={2}
                columnWrapperStyle={{ gap: 10, paddingHorizontal: 12 }}
                contentContainerStyle={{ gap: 10, paddingBottom: 12 }}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={{ flex: 1, borderRadius: 20, overflow: 'hidden' }}
                        onPress={() => handleDetailDishes(item)}>
                        <ImageBackground
                            source={{ uri: Array.isArray(item.imageUrls) ? item.imageUrls[0] : item.imageUrls }}
                            style={{ justifyContent: 'center', alignItems: 'center', height: 100 }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}>{item.name}</Text>
                            </View>
                        </ImageBackground>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text className="text-base text-gray-500 text-center p-5">Không có món ăn.</Text>}
            />
        </>
    );
};

export default MenuScreen;
