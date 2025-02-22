import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import DatePicker from 'react-native-date-picker';
import { COLORS } from '../../code/color';
import CustomTextInput from '../../components/customTextInput';
import { updateInvoice } from '../../handle_code/invoice';
import showToast from '../../components/toastHelper';

function UpdateReservationScreen({ navigation, route }) {
    const { data } = route.params;
    const [date, setDate] = useState(new Date(data.appointmentTime));
    const [open, setOpen] = useState(false);
    const [numberOfPeople, setNumberOfPeople] = useState(data.tableOccupancy.toString());
    const [request, setRequest] = useState(data.notes);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit() {
        if (parseFloat(numberOfPeople) < 1 || numberOfPeople === '') {
            showToast('error', 'Thông báo lỗi', 'Vui lòng nhập số người tham dự.');
            return;
        }

        const invoiceData = {
            customerName: data.customerName,
            customerPhone: data.phoneNumber,
            appointmentTime: new Date(date).toISOString(),
            number: numberOfPeople,
            notes: request,
        };

        const isDataUnchanged =
            data.customerName === invoiceData.customerName &&
            data.phoneNumber === invoiceData.customerPhone &&
            new Date(data.appointmentTime).toISOString() === invoiceData.appointmentTime &&
            data.tableOccupancy.toString() === invoiceData.number &&
            data.notes === invoiceData.notes;

        if (isDataUnchanged) {
            showToast('error', 'Thông báo', 'Thông tin không có sự thay đổi');
            return;
        }

        setIsLoading(true);

        try {
            const result = await updateInvoice(data.id, invoiceData);

            if (data.status !== 3) {
                showToast('success', 'Thông báo', 'Cập nhật thành công, vui lòng chờ đợi xác nhận từ phía nhà hàng.');
            } else {
                showToast('success', 'Thông báo', 'Cập nhật thành công.');
            }

            console.log(result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            navigation.goBack();
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
                    {data ? data.customerName : ''}
                </Text>
                <Text className="my-2">
                    <Text className="font-bold">Số điện thoại: </Text>
                    {data ? data.customerPhone : ''}
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

export default UpdateReservationScreen;
