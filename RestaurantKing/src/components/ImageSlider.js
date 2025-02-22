/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, Image, Dimensions, FlatList } from 'react-native';

const { width } = Dimensions.get('window');

const ImageSlider = ({ data }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!data || !Array.isArray(data.images) || data.images.length === 0) {
        return <Text>No images available.</Text>;
    }

    const onViewableItemsChanged = ({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    };

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    const ITEM_WIDTH = width - 40;

    return (
        <View className="items-center mt-2.5">
            <Text className="font-bold text-lg mb-2">Hình ảnh sản phẩm: </Text>

            <FlatList
                data={data.images}
                horizontal
                pagingEnabled
                snapToInterval={ITEM_WIDTH + 10}
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => (
                    <View
                        style={{
                            width: ITEM_WIDTH,
                            height: 220,
                            marginHorizontal: 5,
                        }}
                        className="rounded-lg overflow-hidden justify-center items-center shadow-lg bg-gray-200"
                    >
                        <Image
                            source={{ uri: item }}
                            className="w-full h-full rounded-lg"
                            resizeMode="contain"
                        />
                    </View>
                )}
            />

            {/* Pagination Dots */}
            <View className="flex-row mt-3">
                {data.images.map((_, index) => (
                    <View
                        key={index}
                        className={`h-0.5 w-4 mx-1 rounded-full ${currentIndex === index ? 'bg-black' : 'bg-gray-300'}`}
                        style={{
                            transition: 'background-color 0.3s',
                            opacity: currentIndex === index ? 1 : 0.5,
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

export default ImageSlider;
