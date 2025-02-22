/* eslint-disable react-native/no-inline-styles */
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Appbar, Button } from 'react-native-paper';
import { getALLInvoices } from '../../handle_code/invoice';
import { useSelector } from 'react-redux';
import { getStatusText } from '../../code/formatStatus';
import { calculateTotalPrice } from '../../code/caculator';
import { formatCurrency } from '../../code/formatMoney';

const TransactionHistory = ({ navigation }) => {
    const user = useSelector(state => state.auth.userData);
    const [data, setData] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [expandedItemId, setExpandedItemId] = useState(null);

    useEffect(() => {
        const fetchData = () => {
            try {
                const unsubscribe = getALLInvoices(user.uid, (d) => {
                    setData(d);
                });

                return unsubscribe;
            } catch (error) {
                console.error('Error fetching invoices:', error);
            }
        };

        fetchData();
    }, [user.uid]);

    const tabs = ['Chờ thanh toán', 'Chờ nhận bàn', 'Đã thanh toán', 'Chờ xác nhận', 'Đã Hủy'];

    const filterDataByStatus = (status) => {
        switch (status) {
            case 0:
                return data.filter(item => item.status === 0);
            case 1:
                return data.filter(item => item.status === 1);
            case 2:
                return data.filter(item => item.status === 2);
            case 3:
                return data.filter(item => item.status === 3);
            case 4:
                return data.filter(item => item.status === 4);
            default:
                return [];
        }
    };

    const toggleExpand = (id) => {
        setExpandedItemId(expandedItemId === id ? null : id);
    };

    const handleReview = (item) => {
        navigation.navigate('Review', { item });
    };

    const renderTabContent = () => {
        const filteredData = filterDataByStatus(activeTab);

        return (
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                        <View style={styles.item}>
                            <Text style={styles.itemText}>Mã hóa đơn: {item.code}</Text>
                            <Text style={styles.itemText}>Status: {getStatusText(item.status)}</Text>

                            {expandedItemId === item.id && (
                                <View style={styles.expandedContent}>
                                    <Text style={styles.itemText}>Tổng tiền: {formatCurrency(calculateTotalPrice(item.selectedItems))}</Text>
                                    <Text style={styles.itemText}>Ngày tạo: {new Date(item.createdAt).toLocaleDateString()}</Text>
                                    <Text style={styles.itemText}>Chi tiết sản phẩm:</Text>
                                    {item.selectedItems.map((product, index) => (
                                        <Text key={index} style={styles.productText}>{product.name} : {product.quantity}</Text>
                                    ))}

                                    {item.status === 2 && (
                                        <>
                                            {item?.rating === false || item?.rating == null ? (
                                                <Button
                                                    mode="outlined"
                                                    className="mt-2"
                                                    onPress={() => handleReview(item)}
                                                    style={{
                                                        borderColor: '#32CD32',
                                                    }}
                                                    labelStyle={{
                                                        color: '#32CD32',
                                                    }}
                                                >
                                                    Đánh giá
                                                </Button>
                                            ) : (
                                                <Text style={{ marginTop: 8, color: '#32CD32', fontWeight: 'bold' }}>
                                                    Đã đánh giá chất lượng dịch vụ
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text style={styles.noData}>Không có dữ liệu</Text>}
            />
        );
    };

    return (
        <View style={styles.container}>
            <Appbar.Header className="bg-white border-b border-gray-200">
                <Appbar.BackAction color="#32CD32" onPress={() => navigation.goBack()} />
                <Appbar.Content title="Lịch sử ăn uống" titleStyle={{ fontSize: 18, fontWeight: 'bold', color: '#374151' }} />
            </Appbar.Header>

            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={styles.scrollView}
            >
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.tab, activeTab === index ? styles.activeTab : null]}
                        onPress={() => setActiveTab(index)}
                    >
                        <Text style={activeTab === index ? styles.activeTabText : styles.tabText}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <View style={styles.contentContainer}>
                {renderTabContent()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        maxHeight: '6%',
    },
    scrollContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tab: {
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        marginHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 3,
        borderBottomColor: '#32CD32',
    },
    tabText: {
        fontSize: 14,
        color: 'black',
    },
    activeTabText: {
        fontSize: 14,
        color: '#32CD32',
    },
    contentContainer: {
        width: '100%',
        flex: 1,
        padding: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        marginHorizontal: 0,
    },
    item: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 5,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#666',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    noData: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        padding: 20,
    },
    expandedContent: {
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
        paddingTop: 10,
    },
    productText: {
        fontSize: 14,
        color: '#555',
    },
});

export default TransactionHistory;
