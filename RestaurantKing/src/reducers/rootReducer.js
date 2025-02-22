// reducers/rootReducer.js
import {applyMiddleware, combineReducers, createStore} from 'redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {persistReducer, persistStore} from 'redux-persist';
import authReducer from './authReducer';
import DataReducer from './dataReducer';
import notifiReducer from './notifiReducer';
import { thunk } from 'redux-thunk';
import QRScanReducer from './qrReducer';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const notificationPersistConfig = {
  key: 'notifications',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authReducer),
  data: DataReducer,
  qrData: QRScanReducer,
  notifications: persistReducer(notificationPersistConfig, notifiReducer),
});

const store = createStore(rootReducer, applyMiddleware(thunk));
const persistor = persistStore(store);

export { store, persistor };
