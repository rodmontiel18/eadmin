import { GenericItem } from '../util';

export interface PaymentMethod extends GenericItem {
  id: string;
  name: string;
  userId: string;
}
