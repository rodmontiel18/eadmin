import { Timestamp } from 'firebase/firestore';
import { Moment } from 'moment';

export type Period = {
  closed: boolean;
  id: string;
  from: Moment;
  name: string;
  outcomeLimit?: number;
  to: Moment;
  userId: string;
};

export type FirebasePeriod = Omit<Period, 'from' | 'to'> & {
  from: Timestamp;
  to: Timestamp;
};
