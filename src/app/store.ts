import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import appReducer from './redux/app/appSlice';
import categoryReducer from './redux/category/categorySlice';
import outcomeGroupReducer from './redux/outcomeGroup/outcomeGroupSlice';
import paymentMethodReducer from './redux/paymentMethod/paymentMethodSlice';
import periodReducer from './redux/period/periodSlice';

export const store = configureStore({
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['app/login/fulfilled'],
      },
    }),
  reducer: {
    app: appReducer,
    category: categoryReducer,
    outcomeGroup: outcomeGroupReducer,
    paymentMethod: paymentMethodReducer,
    period: periodReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
