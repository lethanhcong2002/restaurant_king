/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react/no-unstable-nested-components */

import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Svg, Defs, Mask, Rect } from 'react-native-svg';
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { useDispatch, useSelector } from 'react-redux';
import showToast from '../../components/toastHelper';
import { getTableByGeneratedId } from '../../handle_code/table';
import { getQRData } from '../../actions/qrAction';

export default function QRScanner() {
    const dispatch = useDispatch();
    const data = useSelector(state => state.qrData.qrData);
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice('back');
    const [scanning, setScanning] = useState(true);
    const navigation = useNavigation();

    const scanArea = { x: '18%', y: '30%', width: 250, height: 250 };

    useFocusEffect(
        React.useCallback(() => {
            setScanning(true);
        }, [])
    );

    useEffect(() => {
        if (hasPermission === null) {
            requestPermission();
        }
    }, [hasPermission, requestPermission]);

    if (hasPermission === false) {
        return (
            <View className="flex-1, justify-center items-center">
                <Text>Cần cấp quyền camera để quét mã QR.</Text>
            </View>
        );
    }

    if (!device) {
        return (
            <View className="flex-1, justify-center items-center">
                <Text>Không tìm thấy thiết bị camera.</Text>
            </View>
        );
    }

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (code) => {
            if (scanning && code[0]?.value) {
                const { x, y, width, height } = code[0].frame;
                const isInScanArea = checkIfInScanArea(x, y, width, height);

                if (isInScanArea) {
                    setScanning(false);
                    fetchTableData(code[0].value);
                }
            }
        },
    });

    const checkIfInScanArea = (x, y, width, height) => {
        const area = { x: 0.18 * screenWidth, y: 0.3 * screenHeight, width: 250, height: 250 };
        return (
            x >= area.x &&
            y >= area.y &&
            x + width <= area.x + area.width &&
            y + height <= area.y + area.height
        );
    };

    const fetchTableData = async (tableKey) => {
        const result = await getTableByGeneratedId(tableKey);

        if (result.error) {
            await showToast('error', 'Thông báo lỗi', 'Bàn đã được sử dụng');
            setTimeout(() => {
                setScanning(true);
            }, 5000);
        } else {
            dispatch(getQRData({
                ...data,
                table: result,
            }));
            console.log(result);

            if (data === null) {
                navigation.navigate('Cart', { screen: 'Reservation' });
            } else {
                navigation.navigate('Cart', { screen: 'Order_Menu' });
            }
        }
    };

    function CameraFrame() {
        return (
            <Svg height="100%" width="100%">
                <Defs>
                    <Mask id="mask" x="0" y="0" height="100%" width="100%">
                        <Rect height="100%" width="100%" fill="white" />
                        <Rect
                            x={scanArea.x}
                            y={scanArea.y}
                            height={scanArea.height}
                            width={scanArea.width}
                            fill="black"
                        />
                    </Mask>
                </Defs>
                <Rect height="100%" width="100%" fill="rgba(0, 0, 0, 0.8)" mask="url(#mask)" />
                <Rect
                    x={scanArea.x}
                    y={scanArea.y}
                    height={scanArea.height}
                    width={scanArea.width}
                    strokeWidth="5"
                    stroke="#fff"
                    fill="none"
                />
            </Svg>
        );
    }

    return (
        <View className="flex-1 justify-center items-center ">
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                codeScanner={codeScanner}
            />
            <CameraFrame />
            <View className="absolute top-[15%] left-0 right-0 items-center">
                <Text className=" font-bold text-3xl text-white">Scan</Text>
            </View>
        </View>
    );
}
