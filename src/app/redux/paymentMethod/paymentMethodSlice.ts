import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../models/api';
import { PaymentMethod } from '../../../models/paymentMethods';
import { RequestActions } from '../../../models/util';
import { RootState } from '../../store';
import { getExtraReducers } from '../generic';

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

const COLLECTION_NAME = 'paymentMethod';

export const {
  addUserItemAction: addUserPaymentMethodAction,
  deleteUserItemAction: deleteUserPaymentMethodAction,
  getUserItemsAction: getUserPaymentMethodsAction,
  setUserItemAction: setUserPaymentMethodAction,
} = getExtraReducers<PaymentMethod>(COLLECTION_NAME);

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
          const copyPM: PaymentMethod[] = state.paymentMethods || [];
          const paymentMethod = action.payload.entity as
            | PaymentMethod
            | undefined;
          if (paymentMethod) {
            copyPM.push(paymentMethod);
            state.paymentMethods = copyPM;
            state.error = false;
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
          const respPaymentMethods = action.payload.entity as
            | PaymentMethod[]
            | undefined;
          if (respPaymentMethods) {
            state.paymentMethods = [...respPaymentMethods];
            state.error = false;
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
            state.error = false;
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
          const { paymentMethods } = state;
          const id = action.payload.entityId;
          const copy = paymentMethods ? [...paymentMethods] : [];
          const paymentMethodIndex = copy.findIndex(p => p.id === id);
          copy.splice(paymentMethodIndex, 1);
          state.paymentMethods = copy;
          state.error = false;
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

const getPaymentMethodState = (state: RootState) => state.paymentMethod;

export const selectAction = createSelector(
  getPaymentMethodState,
  p => p.action
);
export const selectPaymentMethods = createSelector(getPaymentMethodState, p => {
  const sortedPaymentMethods = (
    p.paymentMethods ? [...p.paymentMethods] : []
  )?.sort((a: PaymentMethod, b: PaymentMethod) => a.name.localeCompare(b.name));
  if (sortedPaymentMethods.length < 1) return undefined;
  return sortedPaymentMethods;
});
export const selectError = createSelector(getPaymentMethodState, p => p.error);
export const selectPaymentMethod = createSelector(
  getPaymentMethodState,
  p => p.paymentMethod
);
export const selectRequestStatus = createSelector(
  getPaymentMethodState,
  p => p.requestStatus
);

export default paymentMethodSlice.reducer;