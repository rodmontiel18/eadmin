import { Timestamp } from 'firebase/firestore';
import { Moment } from 'moment';

export type Income = {
  amount: number;
  categoryId: string;
  description: string;
  id?: string;
  incomeDate?: Moment;
  periodId: string;
  userId: string;
};

export type FirebaseIncome = Omit<Income, 'incomeDate'> & {
  incomeDate?: Timestamp;
};
