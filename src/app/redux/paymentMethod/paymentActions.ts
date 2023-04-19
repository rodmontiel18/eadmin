import { PaymentMethod } from '../../../models/paymentMethods';
import { getExtraReducers } from '../generic';

export const COLLECTION_NAME = 'paymentMethod';

export const {
  addUserItemAction: addUserPaymentMethodAction,
  deleteUserItemAction: deleteUserPaymentMethodAction,
  getUserItemsAction: getUserPaymentMethodsAction,
  setUserItemAction: setUserPaymentMethodAction,
} = getExtraReducers<PaymentMethod>(COLLECTION_NAME);
