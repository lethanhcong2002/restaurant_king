/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainBottomTab from './mainBottomTab';
import AuthStack from './authStack';
import { useSelector } from 'react-redux';

export default function RouteNavigator() {
  const user = useSelector(state => state.auth.userData);

  return (
    <NavigationContainer>
      {user ? <MainBottomTab /> : <AuthStack />}
    </NavigationContainer>
  );
}
// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import auth from '@react-native-firebase/auth';
// import MainBottomTab from './mainBottomTab';
// import AuthStack from './authStack';
// import { ActivityIndicator, View } from 'react-native';
// import { useSelector } from 'react-redux';

// export default function RouteNavigator() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const userData = useSelector(state => state.auth.userData);
//   useEffect(() => {
//     const unsubscribe = auth().onAuthStateChanged(currentUser => {
//       setUser(currentUser);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   if (loading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       {user ? <MainBottomTab /> : <AuthStack />}
//     </NavigationContainer>
//   );
// }
