import { createSelector } from '@reduxjs/toolkit';
import { Income } from '../../../models/income';
import { Outcome } from '../../../models/outcome';
import { Period } from '../../../models/period/Period';
import { RootState } from '../../store';

const getPeriodState = (state: RootState) => state.period;

export const selectAction = createSelector(getPeriodState, p => p.action);

export const selectError = createSelector(getPeriodState, p => p.error);

export const selectIncome = createSelector(getPeriodState, p => p.income);

export const selectIncomesByPeriodId = (periodId: string) =>
  createSelector(getPeriodState, p => {
    const filteredIncomes = (p.incomes ? [...p.incomes] : [])
      ?.filter(i => i.periodId === periodId)
      ?.sort(
        (a: Income, b: Income) =>
          (a?.incomeDate?.unix() || 0) - (b?.incomeDate?.unix() || 0)
      );
    if (filteredIncomes.length < 1) return undefined;
    return filteredIncomes;
  });

export const selectOutcome = createSelector(getPeriodState, p => p.outcome);

export const selectOutcomesByPeriodId = (periodId: string) =>
  createSelector(getPeriodState, p => {
    const filteredOutcomes = (p.outcomes ? [...p.outcomes] : [])
      ?.filter(o => o.periodId === periodId)
      ?.sort(
        (a: Outcome, b: Outcome) =>
          (a.outcomeDate?.unix() || 0) - (b.outcomeDate?.unix() || 0)
      );
    if (filteredOutcomes.length < 1) return undefined;
    return filteredOutcomes;
  });

export const selectPeriodById = (periodId: string) =>
  createSelector(getPeriodState, p => p.periods?.find(p => p.id === periodId));

export const selectPeriod = createSelector(getPeriodState, p => p.period);

export const selectPeriods = createSelector(getPeriodState, p => {
  const sortedPeriods = (p.periods ? [...p.periods] : [])?.sort(
    (a: Period, b: Period) => (a?.from?.unix() || 0) - (b?.from?.unix() || 0)
  );
  if (sortedPeriods.length < 1) return undefined;
  return sortedPeriods;
});

export const selectRequestStatus = createSelector(
  getPeriodState,
  p => p.requestStatus
);
