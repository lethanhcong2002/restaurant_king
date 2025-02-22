/* eslint-disable react/no-unstable-nested-components */
// import React, { useEffect } from 'react';
// import { store } from './src/reducers/rootReducer';
// import persistStore from 'redux-persist/es/persistStore';
// import { Provider } from 'react-redux';
// import { PersistGate } from 'redux-persist/integration/react';
// import RouteNavigator from './src/routes/routeNavigator';
// import messaging from '@react-native-firebase/messaging';
// import Toast from 'react-native-toast-message';
// import { addNotification } from './src/actions/notifiAction';

// const persistor = persistStore(store);

// function App() {

//   useEffect(() => {
//     const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
//       console.log('Thông báo nhận được trong ứng dụng:', remoteMessage);

//       Toast.show({
//         type: 'success',
//         position: 'top',
//         text1: remoteMessage.notification.title,
//         text2: remoteMessage.notification.body,
//         visibilityTime: 4000,
//         autoHide: true,
//       });

//       store.dispatch(addNotification({
//         title: remoteMessage.notification.title,
//         body: remoteMessage.notification.body,
//         data: remoteMessage.data,
//       }));
//     });

//     messaging().setBackgroundMessageHandler(async remoteMessage => {
//       console.log('Thông báo nhận trong nền:', remoteMessage);
//       store.dispatch(addNotification({
//         title: remoteMessage.notification.title,
//         body: remoteMessage.notification.body,
//         data: remoteMessage.data,
//       }));
//     });

//     messaging().getInitialNotification()
//       .then(remoteMessage => {
//         if (remoteMessage) {
//           console.log('Thông báo khi ứng dụng bị tắt:', remoteMessage);

//           store.dispatch(addNotification({
//             title: remoteMessage.notification.title,
//             body: remoteMessage.notification.body,
//             data: remoteMessage.data,
//           }));
//         }
//       });

//     return () => {
//       unsubscribeOnMessage();
//     };
//   }, []);

//   return (
//     <Provider store={store}>
//       <PersistGate loading={null} persistor={persistor}>
//         <RouteNavigator />
//       </PersistGate>
//       <Toast />
//     </Provider>
//   );
// }

// export default App;

import React, { useEffect } from 'react';
import { store } from './src/reducers/rootReducer';
import persistStore from 'redux-persist/es/persistStore';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import RouteNavigator from './src/routes/routeNavigator';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';
import { addNotification } from './src/actions/notifiAction';
import { ActivityIndicator, Surface, Text } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const persistor = persistStore(store);

function App() {

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (!user) {
        console.log('Phiên đăng nhập hết hạn hoặc người dùng đã đăng xuất. Xóa dữ liệu trong Redux Persist.');
        persistor.purge();
      }
    });

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('Thông báo nhận được trong ứng dụng:', remoteMessage);

      Toast.show({
        type: 'success',
        position: 'top',
        text1: remoteMessage.notification.title,
        text2: remoteMessage.notification.body,
        visibilityTime: 4000,
        autoHide: true,
      });

      store.dispatch(addNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
      }));
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Thông báo nhận trong nền:', remoteMessage);
      store.dispatch(addNotification({
        title: remoteMessage.notification.title,
        body: remoteMessage.notification.body,
        data: remoteMessage.data,
      }));
    });

    messaging().getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Thông báo khi ứng dụng bị tắt:', remoteMessage);

          store.dispatch(addNotification({
            title: remoteMessage.notification.title,
            body: remoteMessage.notification.body,
            data: remoteMessage.data,
          }));
        }
      });

    return () => {
      // Hủy bỏ lắng nghe khi component bị unmount
      unsubscribeAuth();
      unsubscribeOnMessage();
    };
  }, []);

  // Màn hình loading cho PersistGate
  const LoadingScreen = () => (
    <Surface style={styles.loadingContainer}>
      <ActivityIndicator animating={true} size="large" />
      <Text>Đang khôi phục dữ liệu...</Text>
    </Surface>
  );

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <RouteNavigator />
      </PersistGate>
      <Toast />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default App;
