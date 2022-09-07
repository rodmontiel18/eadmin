export interface Outcome {
  amount: number;
  categoryId: string;
  description: string;
  outcomeDate?: number;
  groupId: string;
  id?: string;
  paymentMethodId: string;
  periodId: string;
  responsible: string;
  state?: OutcomeState;
  userId: string;
}

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
