import { createSelector } from '@reduxjs/toolkit';
import { PaymentMethod } from '../../../models/paymentMethods';
import { RootState } from '../../store';

const getPaymentMethodState = (state: RootState) => state.paymentMethod;

export const selectAction = createSelector(
  getPaymentMethodState,
  p => p.action
);

export const selectPaymentMethods = createSelector(getPaymentMethodState, p => {
  const sortedPaymentMethods = (
    p.paymentMethods ? [...p.paymentMethods] : []
  )?.sort((a: PaymentMethod, b: PaymentMethod) => a.name.localeCompare(b.name));
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
