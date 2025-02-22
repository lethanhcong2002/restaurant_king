import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { useDispatch, useSelector } from 'react-redux';
import CustomTextInput from '../../components/customTextInput';
import { COLORS } from '../../code/color';
import { createNewInvoice, createNewInvoiceAfterScan } from '../../handle_code/invoice';
import { getQRData } from '../../actions/qrAction';
import showToast from '../../components/toastHelper';

function ReservationScreen({ navigation }) {
    const dispatch = useDispatch();
    const user = useSelector(state => state.auth.userData);
    const qr = useSelector(state => state.qrData.qrData);
    const [date, setDate] = useState(new Date());
    const [open, setOpen] = useState(false);
    const [numberOfPeople, setNumberOfPeople] = useState('1');
    const [request, setRequest] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    console.log(qr);
    // async function handleSubmit() {
    //     if (parseFloat(numberOfPeople) < 1 || numberOfPeople === '') {
    //         showToast('error', 'Thông báo lỗi', 'Vui lòng nhập số người tham dự');
    //         return;
    //     }

    //     const invoiceData = {
    //         customerId: user.uid,
    //         customerName: user.customerName,
    //         customerEmail: user.email,
    //         customerPhone: user.phoneNumber,
    //         appointmentTime: new Date(date).toISOString(),
    //         number: numberOfPeople,
    //         notes: request,
    //     };

    //     try {
    //         setIsLoading(true);

    //         if (qr) {
    //             const result = await createNewInvoiceAfterScan(invoiceData);
    //             result.tablekey = qr.tablekey;
    //             dispatch(getQRData(result));
    //             navigation.navigate('Order_Menu');
    //         } else {
    //             const result = await createNewInvoice(invoiceData);
    //             if (result) {
    //                 showToast('success', 'Thông báo', 'Hẹn lịch thành công');
    //             }
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     } finally {
    //         setIsLoading(false);
    //         if (!qr) {
    //             navigation.goBack();
    //         }
    //     }
    // }

    async function handleSubmit() {
        if (parseFloat(numberOfPeople) < 1 || numberOfPeople === '') {
            showToast('error', 'Thông báo lỗi', 'Vui lòng nhập số người tham dự');
            return;
        }

        const invoiceData = {
            customerId: user.uid,
            customerName: user.customerName,
            customerEmail: user.email,
            customerPhone: user.phoneNumber,
            appointmentTime: new Date(date).toISOString(),
            number: numberOfPeople,
            notes: request,
        };

        try {
            setIsLoading(true);
            let result;

            if (qr) {
                result = await createNewInvoiceAfterScan(invoiceData);
                result.table = qr.table;
            } else {
                result = await createNewInvoice(invoiceData);
                if (result) {
                    showToast('success', 'Thông báo', 'Hẹn lịch thành công');
                }
            }

            if (result) {
                const updatedQRData = {
                    ...qr,
                    invoice: result,
                };

                dispatch(getQRData(updatedQRData));

                if (qr) {
                    navigation.navigate('Order_Menu');
                } else {
                    navigation.goBack();
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <ScrollView className="p-4">
            <View className="mb-4 justify-center items-center">
                <Text className="text-3xl font-bold">Thông tin đặt bàn</Text>
            </View>
            <View className="my-2">
                <Text className="text-lg my-2 font-bold">Thông tin khách hàng</Text>
                <Text className="my-2">
                    <Text className="font-bold">Tên khách hàng: </Text>
                    {user ? user.customerName : ''}
                </Text>
                <Text className="my-2">
                    <Text className="font-bold">Số điện thoại: </Text>
                    {user ? user.phoneNumber : ''}
                </Text>
            </View>
            <View className="mb-4">
                <CustomTextInput
                    label="Số người tham dự"
                    value={numberOfPeople}
                    keyboardType="decimal-pad"
                    onChangeText={number => {
                        setNumberOfPeople(number);
                    }}
                />
            </View>
            <View className="my-2">
                <TextInput
                    label="Hẹn ngày"
                    mode="outlined"
                    value={date.toLocaleString()}
                    right={
                        <TextInput.Icon icon="calendar" onPress={() => setOpen(true)} />
                    }
                    editable={false}
                />
            </View>

            <DatePicker
                modal
                open={open}
                date={date}
                onConfirm={date => {
                    setOpen(false);
                    setDate(date);
                }}
                onCancel={() => {
                    setOpen(false);
                }}
                minimumDate={new Date()}
            />

            <View className="my-2">
                <TextInput
                    label="Yêu cầu"
                    mode="outlined"
                    activeOutlineColor={COLORS.primary}
                    value={request}
                    onChangeText={text => setRequest(text)}
                    multiline={true}
                    numberOfLines={5}
                />
            </View>

            <View className="my-2">
                <Button
                    mode="contained"
                    loading={isLoading}
                    className="bg-[#32CD32]"
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                </Button>
            </View>
        </ScrollView>
    );
}

export default ReservationScreen;
