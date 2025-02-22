

import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import showToast from '../components/toastHelper';

const CUSTOMER = firestore().collection('customers');
GoogleSignin.configure({
    webClientId:
        '341241663453-qg43r8k99d0810m3tr81e50e6l9hrbb6.apps.googleusercontent.com',
});

async function saveFCMToken(userId) {
    try {
        const authorizationStatus = await messaging().requestPermission();
        if (authorizationStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authorizationStatus === messaging.AuthorizationStatus.PROVISIONAL) {

            const token = await messaging().getToken();

            if (token) {
                const userRef = CUSTOMER.doc(userId);
                await userRef.update({
                    fcmTokens: firestore.FieldValue.arrayUnion(token),
                });
                console.log(`Token ${token} đã được lưu cho user ${userId}.`);
            } else {
                console.log('Không lấy được token FCM.');
            }
        } else {
            console.log('Không có quyền truy cập thông báo.');
        }
    } catch (error) {
        console.error('Lỗi khi lưu FCM Token:', error);
    }
}

async function removeFCMToken(userId) {
    try {
        const token = await messaging().getToken();

        const userRef = CUSTOMER.doc(userId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const fcmTokens = userDoc.data().fcmTokens || [];

            if (fcmTokens.includes(token)) {
                await userRef.update({
                    fcmTokens: firestore.FieldValue.arrayRemove(token),
                });
                console.log(`Token ${token} đã được xóa khỏi user ${userId}.`);
            } else {
                console.log(`Token ${token} không tồn tại trong mảng fcmTokens của user ${userId}.`);
            }
        } else {
            console.log(`User ${userId} không tồn tại trong Firestore.`);
        }
    } catch (error) {
        console.error('Lỗi khi xóa FCM Token:', error);
    }
}

const handleLoginWithEP = (email, password) => {
    return new Promise((resolve, reject) => {
        auth()
            .signInWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;

                if (!user.emailVerified) {
                    const errorMessage = 'Email của bạn chưa được xác thực. Vui lòng kiểm tra email và xác thực tài khoản trước khi đăng nhập.';
                    Alert.alert('Lỗi', errorMessage);
                    reject(errorMessage);
                } else {
                    try {
                        const userData = await getUserData(user.uid);
                        const combinedUserData = {
                            uid: user.uid,
                            customerName: userData.customerName || user.displayName || '',
                            email: userData.customerEmail || user.email || '',
                            phoneNumber: userData.customerPhone || '',
                        };

                        await saveFCMToken(user.uid);
                        showToast('success', 'Thông báo', 'Đăng nhập thành công!');
                        resolve(combinedUserData);
                    } catch (error) {
                        console.error('Error getting user data:', error);
                        showToast('error', 'Thông báo lỗi', 'Đã xảy ra lỗi khi lấy dữ liệu người dùng.');
                        reject(error);
                    }
                }
            })
            .catch(error => {
                console.error('Login error:', error);
                showToast('error', 'Thông báo lỗi', 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
                reject(error);
            });
    });
};

const handleLoginWithGoogle = () => {
    return new Promise((resolve, reject) => {
        GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
            .then(() => GoogleSignin.signIn())
            .then(({ idToken }) => {
                const googleCredential = auth.GoogleAuthProvider.credential(idToken);
                return auth().signInWithCredential(googleCredential);
            })
            .then(userCredential => {
                const user = userCredential.user;
                console.log(user);
                const userData = {
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                };
                resolve(userData);
            })
            .catch(error => {
                console.error(error);
                reject(error);
            });
    });
};

const getUserData = (uid) => {
    return new Promise((resolve, reject) => {
        CUSTOMER
            .doc(uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    resolve(userData);
                } else {
                    reject('Không tìm thấy thông tin người dùng');
                }
            })
            .catch((error) => {
                console.error('Error getting user data:', error);
                reject('Đã xảy ra lỗi khi lấy dữ liệu người dùng');
            });
    });
};

const updateUserInfo = async (uid, newData) => {
    try {
        await CUSTOMER.doc(uid).update(newData);

        const updatedUser = await CUSTOMER.doc(uid).get();

        return updatedUser.data();
    } catch (error) {
        return null;
    }
};


const handleCreateAccount = async (name, email, password, phone) => {
    try {
        const signInMethods = await auth().fetchSignInMethodsForEmail(email);

        if (signInMethods.length > 0) {
            showToast('error', 'Thông báo lỗi', 'Email đã tồn tại. Vui lòng sử dụng email khác.');
            return;
        }

        const userCredential = await auth().createUserWithEmailAndPassword(email, password);

        await userCredential.user.sendEmailVerification();

        await CUSTOMER.doc(userCredential.user.uid).set({
            customerName: name,
            customerEmail: email,
            createdAt: new Date().toISOString(),
            customerPhone: phone,
            status: true,
        });
        showToast('success', 'Thông báo', 'Tài khoản tạo thành công. Vui lòng xác thực email.');
        return 'Account created successfully';
    } catch (error) {
        Alert.alert('Error', error.message);
        throw new Error(error.message);
    }
};

async function handleLogoutAccount(userId) {
    try {
        await removeFCMToken(userId);

        await auth().signOut();

        console.log('User đã được đăng xuất và FCM Token đã được xóa.');
    } catch (error) {
        console.error('Lỗi khi đăng xuất:', error);
        throw error;
    }
}

const sendPassResetEmail = async (email) => {
    try {
        await auth().sendPasswordResetEmail(email);
        return { success: true, message: 'Vui lòng kiểm tra email đổi mật khẩu.' };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, message: 'Lỗi gửi yêu cầu. Vui lòng thử lại sau.' };
    }
};

export { handleLoginWithEP, handleLoginWithGoogle, getUserData, updateUserInfo, handleCreateAccount, handleLogoutAccount, sendPassResetEmail };
