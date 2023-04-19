import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../models/api';
import { PaymentMethod } from '../../../models/paymentMethods';
import { RequestActions } from '../../../models/util';
import {
  addUserPaymentMethodAction,
  COLLECTION_NAME,
  deleteUserPaymentMethodAction,
  getUserPaymentMethodsAction,
  setUserPaymentMethodAction,
} from './paymentActions';

interface PaymentMethodState {
  action: RequestActions;
  error: boolean;
  paymentMethod?: PaymentMethod;
  paymentMethods?: PaymentMethod[];
  requestStatus: RequestStatus;
}

const initialState: PaymentMethodState = {
  action: RequestActions.NONE,
  error: false,
  requestStatus: RequestStatus.IDLE,
};

export const paymentMethodSlice = createSlice({
  initialState,
  name: COLLECTION_NAME,
  reducers: {
    finishRequest: state => {
      state.action = RequestActions.NONE;
      state.requestStatus = RequestStatus.IDLE;
      state.error = false;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.error = action.payload;
    },
    setPaymentMethod: (
      state,
      action: PayloadAction<PaymentMethod | undefined>
    ) => {
      state.paymentMethod = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(addUserPaymentMethodAction.pending, state => {
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
        state.action = RequestActions.ADD;
      })
      .addCase(addUserPaymentMethodAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const copyPM: PaymentMethod[] = state.paymentMethods || [];
          const paymentMethod = action.payload.entity as
            | PaymentMethod
            | undefined;
          if (paymentMethod) {
            copyPM.push(paymentMethod);
            state.paymentMethods = copyPM;
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(addUserPaymentMethodAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(getUserPaymentMethodsAction.pending, state => {
        state.action = RequestActions.GET_USER_ITEMS;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(getUserPaymentMethodsAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const respPaymentMethods = action.payload.entity as
            | PaymentMethod[]
            | undefined;
          if (respPaymentMethods) {
            state.paymentMethods = [...respPaymentMethods];
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(getUserPaymentMethodsAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(setUserPaymentMethodAction.pending, state => {
        state.action = RequestActions.UPDATE;
        state.error = false;
        state.paymentMethod = undefined;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(setUserPaymentMethodAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        const copy: PaymentMethod[] = state.paymentMethods || [];
        if (action.payload.status === 200) {
          state.error = false;
          const currentPaymentMethod = action.payload.entity as
            | PaymentMethod
            | undefined;
          if (currentPaymentMethod) {
            const paymentMethodIndex = copy.findIndex(
              p => p.id === currentPaymentMethod.id
            );
            if (paymentMethodIndex > -1) {
              copy.splice(paymentMethodIndex, 1, currentPaymentMethod);
              state.paymentMethods = copy;
            }
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(setUserPaymentMethodAction.rejected, state => {
        state.error = true;
        state.paymentMethod = undefined;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(deleteUserPaymentMethodAction.pending, state => {
        state.action = RequestActions.DELETE;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(deleteUserPaymentMethodAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200 && action.payload.entityId) {
          state.error = false;
          const { paymentMethods } = state;
          const id = action.payload.entityId;
          const copy = paymentMethods ? [...paymentMethods] : [];
          const paymentMethodIndex = copy.findIndex(p => p.id === id);
          copy.splice(paymentMethodIndex, 1);
          state.paymentMethods = copy;
          state.requestStatus = RequestStatus.SUCCEEDED;
        }
      })
      .addCase(deleteUserPaymentMethodAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      });
  },
});

export const { finishRequest, setError, setPaymentMethod } =
  paymentMethodSlice.actions;

export default paymentMethodSlice.reducer;
