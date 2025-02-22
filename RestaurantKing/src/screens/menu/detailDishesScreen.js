import React from 'react';
import { ScrollView, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../../code/formatMoney';
import ImageSlider from '../../components/ImageSlider';
import { COLORS } from '../../code/color';
import { getCategoryDishes } from '../../code/formatStatus';

function DetailDishesScreen({ navigation }) {
    const data = useSelector(state => state.data.data);
    return (
        <ScrollView className="p-2" showsVerticalScrollIndicator={false}>
            <View className="p-2 mb-2">
                <Card className="p-2" mode="contained" style={{ backgroundColor: COLORS.text_white }}>
                    <Card.Cover source={{ uri: Array.isArray(data.imageUrls) ? data.imageUrls[0] : data.imageUrls }} />
                    <Card.Title title={data.name} titleVariant="titleLarge" subtitle={formatCurrency(data.price)} />
                </Card>
            </View>
            <View className="p-2 mb-2">
                <Card className="p-2" mode="contained" style={{ backgroundColor: COLORS.text_white }}>
                    <Card.Title title={'Thông tin món ăn'} titleVariant="titleLarge" />

                    <Card.Content className="mb-1">
                        <Text variant="bodyLarge" className="font-bold">Mô tả:</Text>
                        {data.notes && (
                            <Text variant="bodyMedium">
                                {data.notes}
                            </Text>
                        )}
                    </Card.Content>

                    <Card.Content className="mb-1">
                        <Text variant="bodyMedium">
                            <Text className="font-bold" variant="bodyLarge">Loại: </Text>
                            {data.type ? 'Combo' : 'Đơn'}
                        </Text>
                    </Card.Content>

                    <Card.Content className="mb-1">
                        <Text variant="bodyMedium">
                            <Text className="font-bold" variant="bodyLarge">Đơn vị: </Text>
                            {data.unit}
                        </Text>
                    </Card.Content>

                    <Card.Content className="mb-1">
                        <Text variant="bodyMedium">
                            <Text className="font-bold" variant="bodyLarge">Danh mục: </Text>
                            {getCategoryDishes(data.category)}
                        </Text>
                    </Card.Content>

                    {data.components && data.components.length > 0 && (
                        <Card.Content>
                            <Text className="font-bold" variant="bodyLarge">Thành phần: </Text>
                            {data.components.map((component, index) => (
                                <Text key={index} variant="bodyMedium" className="ml-2.5 mb-1">
                                    • {component.name}
                                </Text>
                            ))}
                        </Card.Content>
                    )}
                </Card>
                <ImageSlider data={{ images: data.imageUrls }} />
            </View>
        </ScrollView>
    );
}

export default DetailDishesScreen;
