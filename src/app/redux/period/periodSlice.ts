import {
  createAsyncThunk,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentReference,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { RequestStatus } from '../../../models/api';
import { BaseResponse } from '../../../models/api/base';
import { Income } from '../../../models/income';
import { Outcome, OutcomeState } from '../../../models/outcome';
import { Period } from '../../../models/period/Period';
import { RequestActions } from '../../../models/util';
import { genericDataConverter } from '../../../util/firestore';
import { RootState } from '../../store';
import { getUserOutcomesAction as getUserOGOutcomesAction } from '../outcomeGroup/outcomeGroupSlice';
import { AsyncThunkConfig, getExtraReducers, InputParams } from '../generic';

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

const COLLECTION_NAME = 'period';
const OUTCOME_COLLECTION_NAME = 'outcome';
const INCOME_COLLECTION_NAME = 'income';

const getCollection = <T>(
  parentItemId: string,
  subCollection: string
): CollectionReference<T> => {
  return collection(
    db,
    COLLECTION_NAME,
    parentItemId,
    subCollection
  ).withConverter(genericDataConverter<T>());
};

export const addUserIncomeAction = createAsyncThunk<
  BaseResponse<Income>,
  InputParams<Income>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${INCOME_COLLECTION_NAME}/addUser${INCOME_COLLECTION_NAME}`,
  async (params: InputParams<Income>) => {
    const resp: BaseResponse<Income> = {
      error: '',
      status: 500,
    };
    try {
      if (params.entity && params.parentItemId) {
        const incomeCollection = getCollection<Income>(
          params.parentItemId,
          INCOME_COLLECTION_NAME
        );
        const snapIncome = (await addDoc(
          incomeCollection,
          params.entity
        )) as DocumentReference<Income>;
        if (snapIncome?.id) {
          resp.entity = { ...params.entity, id: snapIncome.id };
          resp.status = 200;
        } else {
          resp.error = 'Not found';
          resp.status = 404;
        }
      }
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  }
);

export const addUserOutcomeAction = createAsyncThunk<
  BaseResponse<Outcome>,
  InputParams<Outcome>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${OUTCOME_COLLECTION_NAME}/addUser${OUTCOME_COLLECTION_NAME}`,
  async (params: InputParams<Outcome>) => {
    const resp: BaseResponse<Outcome> = {
      error: '',
      status: 500,
    };
    try {
      if (params.entity && params.parentItemId) {
        const outcomeCollection = getCollection<Outcome>(
          params.parentItemId,
          OUTCOME_COLLECTION_NAME
        );
        const snapOutcome = (await addDoc(
          outcomeCollection,
          params.entity
        )) as DocumentReference<Outcome>;
        if (snapOutcome?.id) {
          resp.entity = { ...params.entity, id: snapOutcome.id };
          resp.status = 200;
        } else {
          resp.error = 'Not found';
          resp.status = 404;
        }
      }
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  }
);

export const deleteUserIncomeAction = createAsyncThunk<
  BaseResponse<Income>,
  InputParams<Income>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${INCOME_COLLECTION_NAME}/deleteUser${INCOME_COLLECTION_NAME}`,
  async (params: InputParams<Income>) => {
    const resp: BaseResponse<Income> = {
      error: '',
      status: 500,
    };
    try {
      if (params.parentItemId) {
        const incomeCollection = getCollection<Income>(
          params.parentItemId,
          INCOME_COLLECTION_NAME
        );
        await deleteDoc(doc(incomeCollection, params.entityId));
        resp.status = 200;
        resp.entityId = params.entityId;
      }
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  }
);

export const deleteUserOutcomeAction = createAsyncThunk<
  BaseResponse<Outcome>,
  InputParams<Outcome>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${OUTCOME_COLLECTION_NAME}/deleteUser${OUTCOME_COLLECTION_NAME}`,
  async (params: InputParams<Outcome>) => {
    const resp: BaseResponse<Outcome> = {
      error: '',
      status: 500,
    };
    try {
      if (params.parentItemId) {
        const outcomeCollection = getCollection<Outcome>(
          params.parentItemId,
          OUTCOME_COLLECTION_NAME
        );
        await deleteDoc(doc(outcomeCollection, params.entityId));
        resp.status = 200;
        resp.entityId = params.entityId;
      }
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  }
);

export const getUserIncomesAction = createAsyncThunk<
  BaseResponse<Income>,
  InputParams<Income>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${INCOME_COLLECTION_NAME}/getUser${INCOME_COLLECTION_NAME}`,
  async (params: InputParams<Income>) => {
    const resp: BaseResponse<Income> = {
      error: '',
      status: 500,
    };
    try {
      if (params.parentItemId) {
        const incomeCollection = getCollection<Income>(
          params.parentItemId,
          INCOME_COLLECTION_NAME
        );
        const items: Income[] = [];
        const querySnap = await getDocs(
          query(incomeCollection, where('userId', '==', params.userId))
        );
        resp.status = 200;
        if (!querySnap.empty) {
          querySnap.forEach(itemSnap => {
            if (itemSnap.exists())
              items.push({ ...itemSnap.data(), id: itemSnap.id });
          });
        }
        resp.entity = items;
      }
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  }
);

export const getUserOutcomesAction = createAsyncThunk<
  BaseResponse<Outcome>,
  InputParams<Outcome>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${OUTCOME_COLLECTION_NAME}/getUser${OUTCOME_COLLECTION_NAME}s`,
  async (params: InputParams<Outcome>) => {
    const resp: BaseResponse<Outcome> = {
      error: '',
      status: 500,
    };
    try {
      if (params.parentItemId) {
        const outcomeCollection = getCollection<Outcome>(
          params.parentItemId,
          OUTCOME_COLLECTION_NAME
        );
        const items: Outcome[] = [];
        const querySnap = await getDocs(
          query(outcomeCollection, where('userId', '==', params.userId || ''))
        );
        resp.status = 200;
        if (!querySnap.empty) {
          querySnap.forEach(itemSnap => {
            if (itemSnap.exists())
              items.push({ ...itemSnap.data(), id: itemSnap.id });
          });
        }
        resp.entity = items;
      }
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  }
);

export const setUserIncomeAction = createAsyncThunk<
  BaseResponse<Income>,
  InputParams<Income>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${INCOME_COLLECTION_NAME}/setUser${INCOME_COLLECTION_NAME}`,
  async (params: InputParams<Income>) => {
    const resp: BaseResponse<Income> = {
      error: '',
      status: 500,
    };
    try {
      if (params.entity && params.parentItemId) {
        const incomeCollection = getCollection<Income>(
          params.parentItemId,
          INCOME_COLLECTION_NAME
        );
        await setDoc(
          doc(incomeCollection, params.entityId),
          { ...params.entity },
          { merge: true }
        );
        resp.entity = { ...params.entity };
        resp.status = 200;
      }
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  }
);

export const setUserOutcomeAction = createAsyncThunk<
  BaseResponse<Outcome>,
  InputParams<Outcome>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${OUTCOME_COLLECTION_NAME}/setUser${OUTCOME_COLLECTION_NAME}`,
  async (params: InputParams<Outcome>) => {
    const resp: BaseResponse<Outcome> = {
      error: '',
      status: 500,
    };
    try {
      if (params.entity && params.parentItemId) {
        const outcomeCollection = getCollection<Outcome>(
          params.parentItemId,
          OUTCOME_COLLECTION_NAME
        );
        await setDoc(
          doc(outcomeCollection, params.entityId),
          { ...params.entity },
          { merge: true }
        );
        resp.entity = { ...params.entity };
        resp.status = 200;
      }
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  }
);

export const deleteUserPeriodAction = createAsyncThunk<
  BaseResponse<Period>,
  string,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/deleteUser${COLLECTION_NAME}`,
  async (periodId, { getState }) => {
    const resp: BaseResponse<Period> = {
      error: '',
      status: 500,
    };
    try {
      const outcomeCollection = getCollection<Outcome>(
        periodId,
        OUTCOME_COLLECTION_NAME
      );
      const incomeCollection = getCollection<Income>(
        periodId,
        INCOME_COLLECTION_NAME
      );
      const state = getState();
      const { incomes, outcomes } = state.period;
      const periodIncomes = incomes?.filter(i => i.periodId === periodId);
      const periodOutcomes = outcomes?.filter(o => o.periodId === periodId);
      const batch = writeBatch(db);

      if (periodIncomes && periodIncomes.length > 0) {
        periodIncomes.forEach(o => {
          const oRef = doc(incomeCollection, `${o.id}`);
          batch.delete(oRef);
        });
      } else {
        const incomesSnap = await getDocs(incomeCollection);
        if (!incomesSnap.empty) {
          incomesSnap.forEach(incomeSnap => {
            const oRef = doc(incomeCollection, incomeSnap.id);
            batch.delete(oRef);
          });
        }
      }

      if (periodOutcomes && periodOutcomes.length > 0) {
        periodOutcomes.forEach(o => {
          const oRef = doc(outcomeCollection, `${o.id}`);
          batch.delete(oRef);
        });
      } else {
        const outcomesSnap = await getDocs(outcomeCollection);
        if (!outcomesSnap.empty) {
          outcomesSnap.forEach(outcomeSnap => {
            const oRef = doc(outcomeCollection, outcomeSnap.id);
            batch.delete(oRef);
          });
        }
      }
      const periodRef = doc(db, COLLECTION_NAME, periodId);
      if (periodRef.id) batch.delete(periodRef);
      await batch.commit();
      resp.entityId = periodId;
      resp.status = 200;
    } catch (error) {
      resp.error = `${error}`;
      console.log(error);
    }
    return resp;
  }
);

export const addOutcomesGroupToPeriod = createAsyncThunk<
  BaseResponse<Outcome>,
  InputParams<Outcome>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/addUserGroup${OUTCOME_COLLECTION_NAME}sTo${COLLECTION_NAME}`,
  async (params: InputParams<Outcome>, { dispatch, getState }) => {
    const response: BaseResponse<Outcome> = {
      error: '',
      status: 500,
    };
    try {
      const { parentItemId: periodId, entityId: groupId } = params;
      if (periodId) {
        const outcomeCollection = getCollection<Outcome>(
          periodId,
          OUTCOME_COLLECTION_NAME
        );
        const state = getState();
        const period = state.period.periods?.find(p => p.id === periodId);
        if (period) {
          const outcomes = state.outcomeGroup.outcomes?.filter(
            o => o.groupId === groupId
          );
          const batch = writeBatch(db);
          let responseOutcomes: Outcome[];
          if (outcomes && outcomes.length > 0) {
            responseOutcomes = [];
            outcomes.forEach(o => {
              const outcomeRef = doc(outcomeCollection);
              const temp: Outcome = {
                ...o,
                periodId,
                outcomeDate: period.to,
                state: OutcomeState.Pending,
              };
              responseOutcomes.push(temp);
              batch.set(outcomeRef, temp);
            });
            response.entity = responseOutcomes;
          } else {
            const groupOutcomesRespAction = await dispatch(
              getUserOGOutcomesAction({
                parentItemId: groupId || '',
              })
            );
            if (
              getUserOGOutcomesAction.fulfilled.match(groupOutcomesRespAction)
            ) {
              const groupOutcomesResp = groupOutcomesRespAction.payload;
              const groupOutcomes = groupOutcomesResp.entity as Outcome[];
              if (groupOutcomes && groupOutcomes.length > 0) {
                responseOutcomes = [];
                groupOutcomes.forEach(o => {
                  const outcomeRef = doc(outcomeCollection);
                  const temp = {
                    ...o,
                    periodId,
                    outcomeDate: period.to,
                    state: OutcomeState.Pending,
                  };
                  responseOutcomes.push(temp);
                  batch.set(outcomeRef, temp);
                });
                response.entity = responseOutcomes;
              }
            }
          }
          await batch.commit();
          response.status = 200;
        }
      }
    } catch (error) {
      response.error = `${error}`;
      console.log(error);
    }
    return response;
  }
);

export const {
  addUserItemAction: addUserPeriodAction,
  getUserItemByIdAction: getUserPeriodByIdAction,
  getUserItemsAction: getUserPeriodsAction,
  setUserItemAction: setUserPeriodAction,
} = getExtraReducers<Period>(COLLECTION_NAME);

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

const getPeriodState = (state: RootState) => state.period;

export const selectAction = createSelector(getPeriodState, p => p.action);
export const selectError = createSelector(getPeriodState, p => p.error);
export const selectIncome = createSelector(getPeriodState, p => p.income);
export const selectIncomesByPeriodId = (periodId: string) =>
  createSelector(getPeriodState, p => {
    const filteredIncomes = (p.incomes ? [...p.incomes] : [])
      ?.filter(i => i.periodId === periodId)
      ?.sort(
        (a: Income, b: Income) => (a.incomeDate || 0) - (b.incomeDate || 0)
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
        (a: Outcome, b: Outcome) => (a.outcomeDate || 0) - (b.outcomeDate || 0)
      );
    if (filteredOutcomes.length < 1) return undefined;
    return filteredOutcomes;
  });
export const selectPeriodById = (periodId: string) =>
  createSelector(getPeriodState, p => p.periods?.find(p => p.id === periodId));
export const selectPeriod = createSelector(getPeriodState, p => p.period);
export const selectPeriods = createSelector(getPeriodState, p => {
  const sortedPeriods = (p.periods ? [...p.periods] : [])?.sort(
    (a: Period, b: Period) => (a.from || 0) - (b.from || 0)
  );
  if (sortedPeriods.length < 1) return undefined;
  return sortedPeriods;
});
export const selectRequestStatus = createSelector(
  getPeriodState,
  p => p.requestStatus
);

export default periodSlice.reducer;
