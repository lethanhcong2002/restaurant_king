/* eslint-disable react-hooks/rules-of-hooks */
import { CommonActions } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { resetAllData } from './resetData';

function resetStackOnTabPress(tabName, defaultScreen) {
    const dispatch = useDispatch();

    return ({ navigation }) => ({
        tabPress: (e) => {
            e.preventDefault();

            resetAllData(dispatch);

            if (tabName === 'QRScan') {
                navigation.navigate(tabName);
            } else {
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: tabName, params: { screen: defaultScreen } }],
                    })
                );
            }
        },
    });
}

const resetStack = (navigation, tabName, defaultScreen) => {
    navigation.dispatch(
        CommonActions.reset({
            index: 0,
            routes: [{ name: tabName, params: { screen: defaultScreen } }],
        })
    );
};

export {resetStackOnTabPress, resetStack};
