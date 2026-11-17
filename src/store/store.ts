import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import osReducer from './osSlice';
import windowReducer from './windowSlice';
import portfolioReducer from './portfolioSlice';

const osPersistConfig = {
  key: 'os',
  storage,
  blacklist: ['isShuttingDown'],
};

const rootReducer = combineReducers({
  os: persistReducer(osPersistConfig, osReducer),
  windows: windowReducer,
  portfolio: portfolioReducer,
});

const persistConfig = {
  key: 'tonmoy-os-root',
  version: 1,
  storage,
  whitelist: ['windows', 'portfolio'], // 'os' is now handled separately
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
