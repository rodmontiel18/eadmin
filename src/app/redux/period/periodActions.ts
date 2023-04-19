import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  addDoc,
  collection,
  CollectionReference,
  deleteDoc,
  doc,
  DocumentData,
  DocumentReference,
  FirestoreDataConverter,
  getDocs,
  query,
  QueryDocumentSnapshot,
  setDoc,
  Timestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';
import { BaseResponse } from '../../../models/api/base';
import { FirebaseIncome, Income } from '../../../models/income';
import {
  FirebaseOutcome,
  Outcome,
  OutcomeState,
} from '../../../models/outcome';
import { FirebasePeriod, Period } from '../../../models/period/Period';
import { genericDataConverter } from '../../../util/firestore';
import { AsyncThunkConfig, getExtraReducers, InputParams } from '../generic';
import { getUserOutcomesAction as getUserOGOutcomesAction } from '../outcomeGroup';
import moment from 'moment';

export const COLLECTION_NAME = 'period';
export const OUTCOME_COLLECTION_NAME = 'outcome';
export const INCOME_COLLECTION_NAME = 'income';

const getCollection = <T>(
  parentItemId: string,
  subCollection: string,
  converter?: FirestoreDataConverter<T>
): CollectionReference<T> => {
  return collection(
    db,
    COLLECTION_NAME,
    parentItemId,
    subCollection
  ).withConverter(converter || genericDataConverter<T>());
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
          INCOME_COLLECTION_NAME,
          incomeConverter
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
          OUTCOME_COLLECTION_NAME,
          outcomeConverter
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
          INCOME_COLLECTION_NAME,
          incomeConverter
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
          OUTCOME_COLLECTION_NAME,
          outcomeConverter
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
          INCOME_COLLECTION_NAME,
          incomeConverter
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
          OUTCOME_COLLECTION_NAME,
          outcomeConverter
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
          INCOME_COLLECTION_NAME,
          incomeConverter
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
          OUTCOME_COLLECTION_NAME,
          outcomeConverter
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
        OUTCOME_COLLECTION_NAME,
        outcomeConverter
      );
      const incomeCollection = getCollection<Income>(
        periodId,
        INCOME_COLLECTION_NAME,
        incomeConverter
      );
      const state = getState();
      const { incomes, outcomes } = state.period;
      const { user } = state.app;
      const periodIncomes = incomes?.filter(i => i.periodId === periodId);
      const periodOutcomes = outcomes?.filter(o => o.periodId === periodId);
      const batch = writeBatch(db);

      if (periodIncomes && periodIncomes.length > 0) {
        periodIncomes.forEach(o => {
          const oRef = doc(incomeCollection, `${o.id}`);
          batch.delete(oRef);
        });
      } else {
        const incomesSnap = await getDocs(
          query(incomeCollection, where('userId', '==', user?.uid))
        );
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
        const outcomesSnap = await getDocs(
          query(outcomeCollection, where('userId', '==', user?.uid))
        );
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
          OUTCOME_COLLECTION_NAME,
          outcomeConverter
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

const periodConverter: FirestoreDataConverter<Period> = {
  toFirestore: (period: Period): DocumentData => {
    const fPeriod: FirebasePeriod = {
      ...period,
      from: Timestamp.fromDate(
        period.from
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .toDate()
      ),
      to: Timestamp.fromDate(
        period.to
          .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
          .toDate()
      ),
    };
    return fPeriod as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirebasePeriod>): Period => {
    const fPeriod: FirebasePeriod = snapshot.data();
    return {
      ...fPeriod,
      from: moment(fPeriod.from.toDate()).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      }),
      to: moment(fPeriod.to.toDate()).set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      }),
    };
  },
};

const incomeConverter: FirestoreDataConverter<Income> = {
  toFirestore: (income: Income): DocumentData => {
    const fIncome: FirebaseIncome = {
      ...income,
      incomeDate: income?.incomeDate
        ? Timestamp.fromDate(
            income.incomeDate
              .set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
              })
              .toDate()
          )
        : undefined,
    };
    return fIncome as DocumentData;
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot<FirebaseIncome>): Income => {
    const fIncome: FirebaseIncome = snapshot.data();
    return {
      ...fIncome,
      incomeDate: fIncome?.incomeDate
        ? moment(fIncome.incomeDate.toDate()).set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          })
        : undefined,
    };
  },
};

const outcomeConverter: FirestoreDataConverter<Outcome> = {
  toFirestore: (outcome: Outcome): DocumentData => {
    const fOutcome: FirebaseOutcome = {
      ...outcome,
      outcomeDate: outcome?.outcomeDate
        ? Timestamp.fromDate(
            outcome.outcomeDate
              .set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0,
              })
              .toDate()
          )
        : undefined,
    };
    return fOutcome as DocumentData;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<FirebaseOutcome>
  ): Outcome => {
    const fOutcome: FirebaseOutcome = snapshot.data();
    return {
      ...fOutcome,
      outcomeDate: fOutcome?.outcomeDate
        ? moment(fOutcome.outcomeDate.toDate()).set({
            hour: 0,
            minute: 0,
            second: 0,
            millisecond: 0,
          })
        : undefined,
    };
  },
};

export const {
  addUserItemAction: addUserPeriodAction,
  getUserItemByIdAction: getUserPeriodByIdAction,
  getUserItemsAction: getUserPeriodsAction,
  setUserItemAction: setUserPeriodAction,
} = getExtraReducers<Period>(COLLECTION_NAME, periodConverter);
