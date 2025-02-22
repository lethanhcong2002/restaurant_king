import React, { useState } from 'react';
import { IconButton, Menu, Portal } from 'react-native-paper';
import CustomDialog from './customDialog';
import { updateInvoiceStatus } from '../handle_code/invoice';
import { useDispatch } from 'react-redux';
import { getQRData } from '../actions/qrAction';

function CustomDotCart({ navigation, reservationData }) {

    const dispatch = useDispatch();

    const [menuVisible, setMenuVisible] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    const showDialog = () => {
        closeMenu();
        setDialogVisible(true);
    };

    const hideDialog = () => setDialogVisible(false);

    const navigateTo = screenName => {
        closeMenu();
        navigation.navigate(screenName, { data: reservationData });
    };

    const navigateToQR = () => {
        closeMenu();
        dispatch(getQRData(reservationData));
        navigation.navigate('QRScan');
    };

    const handleCancelReservation = () => {
        updateInvoiceStatus(reservationData.id, 4);
        hideDialog();
    };

    return (
        <>
            <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={<IconButton icon="dots-vertical" onPress={openMenu} />}>
                <Menu.Item
                    title="Xem chi tiết"
                    onPress={() => navigateTo('Detail_Reservation')}
                />
                {reservationData.status === 0 ? (
                    <>
                        <Menu.Item
                            title="Gọi món"
                            onPress={() => navigateTo('Order_Again')}
                        />
                        <Menu.Item
                            title="Thanh toán"
                        />
                    </>
                ) : reservationData.status === 1 ? (
                    <>
                        <Menu.Item
                            title="Nhận bàn"
                            onPress={navigateToQR}
                        />
                        <Menu.Item onPress={showDialog} title="Hủy đặt bàn" />
                    </>
                ) : (
                    <>
                        <Menu.Item
                            title="Cập nhật thông tin"
                            onPress={() => navigateTo('Update_Reservation')}
                        />
                        <Menu.Item onPress={showDialog} title="Hủy đặt bàn" />
                    </>
                )}
            </Menu>

            <Portal>
                <CustomDialog
                    visible={dialogVisible}
                    onDismiss={hideDialog}
                    title="Xác nhận hủy đặt bàn"
                    content="Bạn có chắc muốn hủy đặt bàn này?"
                    onConfirm={handleCancelReservation}
                />
            </Portal>
        </>
    );
}

export default CustomDotCart;
