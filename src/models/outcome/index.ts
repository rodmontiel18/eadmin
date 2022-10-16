import { Timestamp } from 'firebase/firestore';
import { Moment } from 'moment';

export type Outcome = {
  amount: number;
  categoryId: string;
  description: string;
  outcomeDate?: Moment;
  groupId: string;
  id?: string;
  paymentMethodId: string;
  periodId: string;
  responsible: string;
  state?: OutcomeState;
  userId: string;
};

export type FirebaseOutcome = Omit<Outcome, 'outcomeDate'> & {
  outcomeDate?: Timestamp;
};

export enum OutcomeTabs {
  Periods = 1,
  Groups,
}

export enum OutcomeSection {
  PeriodList = 1,
  OutcomeList,
}

export enum OutcomeState {
  Paid = 1,
  Pending,
  Separated,
}
