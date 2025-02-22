/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Appbar, IconButton } from 'react-native-paper';
import { getAllDishes, getLatestDish } from '../../handle_code/dishes';
import { useDispatch } from 'react-redux';
import { getData } from '../../actions/dataAction';
import { getPopular } from '../../handle_code/invoice';
import LoadingComponent from '../../components/loadingComponent';

const HomeScreen = ({ navigation }) => {
    const [bodyData, setBodyData] = useState([]);
    const [popularDishes, setPopularDishes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchData = () => {
            getPopular((popularItems) => {
                getLatestDish((latestDishes) => {
                    getAllDishes((allDishes) => {
                        const popularItemIds = popularItems.map(item => item.itemId);
                        const popularDishes = allDishes.filter(dish => popularItemIds.includes(dish.id));

                        setPopularDishes(popularDishes.slice(0, 5));
                        setBodyData(latestDishes);
                        setIsLoading(false);
                    });
                });
            });
        };

        fetchData();
    }, []);

    const handleDetailDishes = (item) => {
        navigation.navigate('Detail_Dishes');
        dispatch(getData(item));
    };

    return (
        <>
            <Appbar.Header className="bg-white flex-row items-center px-4 shadow-md">
                <Text className="flex-1 text-lg font-semibold text-black text-center">Restaurant King</Text>

                <View className="flex-row space-x-2">
                    <IconButton
                        icon="bell"
                        color="#004d00"
                        size={24}
                        onPress={() => navigation.navigate('NotificationScreen')}
                    />

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

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingComponent message="Đang tải dữ liệu..." />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View className="py-4 px-4">
                        <Text className="text-2xl font-bold">Thịnh hành nhất</Text>

                        {popularDishes.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                className="flex-1 rounded-2xl overflow-hidden my-2"
                                onPress={() => handleDetailDishes(item)}
                            >
                                <ImageBackground
                                    source={{ uri: Array.isArray(item.imageUrls) ? item.imageUrls[0] : item.imageUrls }}
                                    className="justify-center items-center flex-row h-24"
                                >
                                    <View className="justify-center items-center h-full w-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                        <Text className="text-white font-bold text-lg">{item.name}</Text>
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View className="py-4">
                        <ImageBackground source={require('../../asset/banner.jpg')} className="h-36 justify-center items-center">
                            <View className="justify-center items-center h-full w-full bg-black/30">
                                <Text className="text-white text-xl font-bold">Ưu Đãi Đặc Biệt!</Text>
                                <Text className="text-white text-sm">Giảm giá đến 50% các món hot nhất!</Text>
                            </View>
                        </ImageBackground>
                    </View>

                    <View className="py-4 px-4">
                        <Text className="text-2xl font-bold">Mới nhất</Text>
                        {bodyData.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                className="flex-1 rounded-2xl overflow-hidden my-2"
                                onPress={() => handleDetailDishes(item)}
                            >
                                <ImageBackground
                                    source={{ uri: Array.isArray(item.imageUrls) ? item.imageUrls[0] : item.imageUrls }}
                                    className="justify-center items-center flex-row h-24"
                                >
                                    <View className="justify-center items-center h-full w-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                                        <Text className="text-white font-bold text-lg">{item.name}</Text>
                                    </View>
                                </ImageBackground>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            )}
        </>
    );
};

export default HomeScreen;
