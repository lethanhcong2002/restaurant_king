/* eslint-disable react-native/no-inline-styles */

import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Button, TextInput, Card, Title, Paragraph, Text, Appbar } from 'react-native-paper';
import { Rating } from 'react-native-ratings';
import { COLORS } from '../../code/color';
import { formatDate } from '../../code/formatDate';
import { serviceRating } from '../../handle_code/invoice';
import showToast from '../../components/toastHelper';

const ServiceRating = ({ navigation, route }) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const { item } = route.params;
    const submitReview = async () => {
        if (!review) {
            showToast('error', 'Thông báo lỗi', 'Vui lòng nhập đánh giá của bạn vào.');
            return;
        }
        const result = await serviceRating(item.id, rating, review, item.code);
        if (result) {
            showToast('success', 'Thông báo', 'Đánh giá thành công.');
            navigation.goBack();
        } else {
            showToast('error', 'Thông báo lỗi', 'Đánh giá thất bại.');
        }
    };

    return (
        <>
            <Appbar.Header className="bg-white border-b border-gray-200">
                <Appbar.BackAction color="#32CD32" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Đánh giá chất lượng dịch vụ" titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }} />
            </Appbar.Header>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                className="p-4 bg-gray-100"
            >
                <Card className="mb-2">
                    <Card.Title
                        title="Nhà hàng Restaurant King"
                        subtitle={`HD: ${item.code}`}
                    />
                    <Card.Content>
                        <Text className="text-gray-500">Ngày thanh toán: {formatDate(item.updatedAt)}</Text>
                    </Card.Content>
                </Card>

                <View className="items-center mb-2">
                    <Rating
                        type="custom"
                        fractions={1}
                        startingValue={0}
                        imageSize={40}
                        ratingColor="#32CD32"
                        tintColor="#f3f4f6"
                        showRating
                        className="py-3"
                        onFinishRating={(ratingValue) => setRating(ratingValue)}
                    />
                </View>

                <TextInput
                    label="Đánh giá của bạn"
                    mode="outlined"
                    value={review}
                    onChangeText={(text) => setReview(text)}
                    placeholder="Chia sẻ cảm nhận về chất lượng dịch vụ..."
                    className=" bg-white"
                    multiline
                    numberOfLines={4}
                    theme={{
                        colors: {
                            primary: COLORS.primary,
                            underlineColor: 'transparent',
                        },
                    }}
                />

                <Button
                    mode="contained"
                    onPress={submitReview}
                    className="bg-red-500 py-1"
                    labelStyle={{ fontWeight: 'bold' }}
                    style={{ marginTop: 'auto' }}
                >
                    Xác nhận
                </Button>
            </ScrollView>

        </>
    );
};

export default ServiceRating;
