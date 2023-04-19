import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RequestStatus } from '../../../models/api';
import { Income } from '../../../models/income';
import { Outcome } from '../../../models/outcome';
import { Period } from '../../../models/period/Period';
import { RequestActions } from '../../../models/util';
import {
  addOutcomesGroupToPeriod,
  addUserIncomeAction,
  addUserOutcomeAction,
  addUserPeriodAction,
  COLLECTION_NAME,
  deleteUserIncomeAction,
  deleteUserOutcomeAction,
  deleteUserPeriodAction,
  getUserIncomesAction,
  getUserOutcomesAction,
  getUserPeriodByIdAction,
  getUserPeriodsAction,
  setUserIncomeAction,
  setUserOutcomeAction,
  setUserPeriodAction,
} from './periodActions';

interface PeriodState {
  action: RequestActions;
  error: boolean;
  income?: Income;
  incomes?: Income[];
  outcome?: Outcome;
  outcomes?: Outcome[];
  period?: Period;
  periods?: Period[];
  requestStatus: RequestStatus;
}

const initialState: PeriodState = {
  action: RequestActions.NONE,
  error: false,
  requestStatus: RequestStatus.IDLE,
};

export const periodSlice = createSlice({
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
    setOutcome: (state, action: PayloadAction<Outcome | undefined>) => {
      state.outcome = action.payload;
    },
    setIncome: (state, action: PayloadAction<Income | undefined>) => {
      state.income = action.payload;
    },
    setPeriod: (state, action: PayloadAction<Period | undefined>) => {
      state.period = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(addOutcomesGroupToPeriod.pending, state => {
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
        state.action = RequestActions.ADD;
      })
      .addCase(addOutcomesGroupToPeriod.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          let copy: Outcome[] = state.outcomes || [];
          const currentOutcomes = action.payload.entity as
            | Outcome[]
            | undefined;
          if (currentOutcomes && currentOutcomes.length > 0) {
            copy = [...copy, ...currentOutcomes];
            state.outcomes = copy;
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(addOutcomesGroupToPeriod.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(addUserIncomeAction.pending, state => {
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
        state.action = RequestActions.ADD;
      })
      .addCase(addUserIncomeAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const copy: Income[] = state.incomes || [];
          const currentIncome = action.payload.entity as Income | undefined;
          if (currentIncome) {
            copy.push(currentIncome);
            state.incomes = copy;
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(addUserIncomeAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(addUserOutcomeAction.pending, state => {
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
        state.action = RequestActions.ADD;
      })
      .addCase(addUserOutcomeAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const copy: Outcome[] = state.outcomes || [];
          const currentOutcome = action.payload.entity as Outcome | undefined;
          if (currentOutcome) {
            copy.push(currentOutcome);
            state.outcomes = copy;
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(addUserOutcomeAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(addUserPeriodAction.pending, state => {
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
        state.action = RequestActions.ADD;
      })
      .addCase(addUserPeriodAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const copy: Period[] = state.periods || [];
          const currentPeriod = action.payload.entity as Period | undefined;
          if (currentPeriod) {
            copy.push(currentPeriod);
            state.periods = copy;
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(addUserPeriodAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(deleteUserIncomeAction.pending, state => {
        state.action = RequestActions.DELETE;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(deleteUserIncomeAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200 && action.payload.entityId) {
          state.error = false;
          const { incomes } = state;
          const id = action.payload.entityId;
          const copy = incomes ? [...incomes.filter(i => i.id !== id)] : [];
          state.incomes = copy;
          state.requestStatus = RequestStatus.SUCCEEDED;
        }
      })
      .addCase(deleteUserIncomeAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(deleteUserOutcomeAction.pending, state => {
        state.action = RequestActions.DELETE;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(deleteUserOutcomeAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200 && action.payload.entityId) {
          state.error = false;
          const { outcomes } = state;
          const id = action.payload.entityId;
          const copy = outcomes ? [...outcomes.filter(o => o.id !== id)] : [];
          state.outcomes = copy;
          state.requestStatus = RequestStatus.SUCCEEDED;
        }
      })
      .addCase(deleteUserOutcomeAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(deleteUserPeriodAction.pending, state => {
        state.action = RequestActions.DELETE;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(deleteUserPeriodAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200 && action.payload.entityId) {
          state.error = false;
          const periodId = action.payload.entityId;
          const { incomes, periods, outcomes } = state;
          if (incomes) {
            const incomesCopy = [
              ...incomes.filter(i => i.periodId !== periodId),
            ];
            state.incomes = [...incomesCopy];
          }
          if (outcomes) {
            const outcomesCopy = [
              ...outcomes.filter(o => o.periodId !== periodId),
            ];
            state.outcomes = [...outcomesCopy];
          }
          const periodsCopy = periods
            ? [...periods.filter(p => p.id !== periodId)]
            : [];
          state.periods = periodsCopy;
          state.requestStatus = RequestStatus.SUCCEEDED;
        }
      })
      .addCase(deleteUserPeriodAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(getUserIncomesAction.pending, state => {
        state.action = RequestActions.GET_USER_ITEMS;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(getUserIncomesAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const incomesCopy = state.incomes ? [...state.incomes] : [];
          const respIncomes = action.payload.entity as Income[] | undefined;
          if (respIncomes) {
            state.incomes = [...respIncomes, ...incomesCopy];
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(getUserIncomesAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(getUserOutcomesAction.pending, state => {
        state.action = RequestActions.GET_USER_ITEMS;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(getUserOutcomesAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const outcomesCopy = state.outcomes ? [...state.outcomes] : [];
          const respOutcomes = action.payload.entity as Outcome[] | undefined;
          if (respOutcomes) {
            state.outcomes = [...respOutcomes, ...outcomesCopy];
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(getUserOutcomesAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(getUserPeriodByIdAction.pending, state => {
        state.action = RequestActions.GET_USER_ITEM;
        state.error = false;
        state.period = undefined;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(getUserPeriodByIdAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        const currentPeriods = (state.periods || []) as Period[];
        if (action.payload.status === 200) {
          state.error = false;
          const respPeriod = action.payload.entity as Period | undefined;
          if (respPeriod) {
            state.periods = [...currentPeriods, respPeriod];
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(getUserPeriodByIdAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(getUserPeriodsAction.pending, state => {
        state.action = RequestActions.GET_USER_ITEMS;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(getUserPeriodsAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const respPeriods = action.payload.entity as Period[] | undefined;
          if (respPeriods) {
            state.periods = [...respPeriods];
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(getUserPeriodsAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(setUserIncomeAction.pending, state => {
        state.action = RequestActions.UPDATE;
        state.error = false;
        state.income = undefined;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(setUserIncomeAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        const copy: Income[] = state.incomes || [];
        if (action.payload.status === 200) {
          state.error = false;
          const currentIncome = action.payload.entity as Income | undefined;
          if (currentIncome) {
            const incomeIndex = copy.findIndex(o => o.id === currentIncome.id);
            if (incomeIndex > -1) {
              copy.splice(incomeIndex, 1, currentIncome);
              state.incomes = copy;
            }
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(setUserIncomeAction.rejected, state => {
        state.error = true;
        state.outcome = undefined;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(setUserOutcomeAction.pending, state => {
        state.action = RequestActions.UPDATE;
        state.error = false;
        state.outcome = undefined;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(setUserOutcomeAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        const copy: Outcome[] = state.outcomes || [];
        if (action.payload.status === 200) {
          state.error = false;
          const currentOutcome = action.payload.entity as Outcome | undefined;
          if (currentOutcome) {
            const outcomeIndex = copy.findIndex(
              o => o.id === currentOutcome.id
            );
            if (outcomeIndex > -1) {
              copy.splice(outcomeIndex, 1, currentOutcome);
              state.outcomes = copy;
            }
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(setUserOutcomeAction.rejected, state => {
        state.error = true;
        state.outcome = undefined;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(setUserPeriodAction.pending, state => {
        state.action = RequestActions.UPDATE;
        state.error = false;
        state.period = undefined;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(setUserPeriodAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        const copy: Period[] = state.periods || [];
        if (action.payload.status === 200) {
          state.error = false;
          const currentPeriod = action.payload.entity as Period | undefined;
          if (currentPeriod) {
            const periodIndex = copy.findIndex(p => p.id === currentPeriod.id);
            if (periodIndex > -1) {
              copy.splice(periodIndex, 1, currentPeriod);
              state.periods = copy;
            }
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(setUserPeriodAction.rejected, state => {
        state.error = true;
        state.period = undefined;
        state.requestStatus = RequestStatus.FAILED;
      });
  },
});

export const { finishRequest, setError, setPeriod, setIncome, setOutcome } =
  periodSlice.actions;
export default periodSlice.reducer;
