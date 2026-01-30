import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { reduxStorage } from './storage';

// Import slices
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import cartReducer from './slices/cartSlice';
import ordersReducer from './slices/ordersSlice';
import announcementsReducer from './slices/announcementsSlice';
import notificationsReducer from './slices/notificationsSlice';
import messagesReducer from './slices/messagesSlice';
import currenciesReducer from './slices/currenciesSlice';
import analyticsReducer from './slices/analyticsSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  categories: categoriesReducer,
  cart: cartReducer,
  orders: ordersReducer,
  announcements: announcementsReducer,
  notifications: notificationsReducer,
  messages: messagesReducer,
  currencies: currenciesReducer,
  analytics: analyticsReducer,
});

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: [
    'auth',
    'products',
    'categories',
    'cart',
    'orders',
    'announcements',
    'notifications',
    'messages',
    'currencies',
    'analytics',
  ], // add slices here to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
