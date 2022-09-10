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
import { Outcome } from '../../../models/outcome';
import { OutcomeGroup } from '../../../models/outcomeGroup/OutcomeGroup';
import { RequestActions } from '../../../models/util';
import { genericDataConverter } from '../../../util/firestore';
import { RootState } from '../../store';
import { AsyncThunkConfig, getExtraReducers, InputParams } from '../generic';

interface OutcomeGroupState {
  action: RequestActions;
  error: boolean;
  outcome?: Outcome;
  outcomeGroup?: OutcomeGroup;
  outcomeGroups?: OutcomeGroup[];
  outcomes?: Outcome[];
  requestStatus: RequestStatus;
}

const initialState: OutcomeGroupState = {
  action: RequestActions.NONE,
  error: false,
  requestStatus: RequestStatus.IDLE,
};

const COLLECTION_NAME = 'outcomeGroup';
const OUTCOME_COLLECTION_NAME = 'outcome';

const getCollection = (parentItemId: string): CollectionReference<Outcome> => {
  return collection(
    db,
    COLLECTION_NAME,
    parentItemId,
    OUTCOME_COLLECTION_NAME
  ).withConverter(genericDataConverter<Outcome>());
};

export const addUserOutcomeAction = createAsyncThunk<
  BaseResponse<Outcome>,
  InputParams<Outcome>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${OUTCOME_COLLECTION_NAME}/addUser${COLLECTION_NAME}`,
  async (params: InputParams<Outcome>) => {
    const resp: BaseResponse<Outcome> = {
      error: '',
      status: 500,
    };
    try {
      if (params.entity && params.parentItemId) {
        const outcomeCollection = getCollection(params.parentItemId);
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
        const outcomeCollection = getCollection(params.parentItemId);
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

export const getUserOutcomesAction = createAsyncThunk<
  BaseResponse<Outcome>,
  InputParams<Outcome>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${OUTCOME_COLLECTION_NAME}/getUser${COLLECTION_NAME}`,
  async (params: InputParams<Outcome>) => {
    const resp: BaseResponse<Outcome> = {
      error: '',
      status: 500,
    };
    try {
      if (params.parentItemId) {
        const outcomeCollection = getCollection(params.parentItemId);
        const items: Outcome[] = [];
        const querySnap = await getDocs(
          query(outcomeCollection, where('userId', '==', params.userId))
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

export const setUserOutcomeAction = createAsyncThunk<
  BaseResponse<Outcome>,
  InputParams<Outcome>,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/${OUTCOME_COLLECTION_NAME}/setUser${COLLECTION_NAME}`,
  async (params: InputParams<Outcome>) => {
    const resp: BaseResponse<Outcome> = {
      error: '',
      status: 500,
    };
    try {
      if (params.entity && params.parentItemId) {
        const outcomeCollection = getCollection(params.parentItemId);
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

export const deleteUserOutcomeGroupAction = createAsyncThunk<
  BaseResponse<OutcomeGroup>,
  string,
  AsyncThunkConfig
>(
  `${COLLECTION_NAME}/deleteUser${COLLECTION_NAME}`,
  async (outcomeGroupId, { getState }) => {
    const resp: BaseResponse<OutcomeGroup> = {
      error: '',
      status: 500,
    };
    try {
      const outcomeCollection = getCollection(outcomeGroupId);
      const state = getState();
      const { outcomes } = state.outcomeGroup;
      const { user } = state.app;
      const groupOutcomes = outcomes?.filter(o => o.groupId === outcomeGroupId);
      const batch = writeBatch(db);
      if (groupOutcomes && groupOutcomes.length > 0) {
        groupOutcomes.forEach(o => {
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
      const periodRef = doc(db, COLLECTION_NAME, outcomeGroupId);
      if (periodRef.id) batch.delete(periodRef);
      await batch.commit();
      resp.status = 200;
      resp.entityId = outcomeGroupId;
    } catch (error) {
      resp.error = `${error}`;
      console.log(error);
    }
    return resp;
  }
);

export const {
  addUserItemAction: addUserOutcomeGroupAction,
  getUserItemByIdAction: getUserOutcomeGroupByIdAction,
  getUserItemsAction: getUserOutcomeGroupsAction,
  setUserItemAction: setUserOutcomeGroupAction,
} = getExtraReducers<OutcomeGroup>(COLLECTION_NAME);

export const outcomeGroupSlice = createSlice({
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
    setOutcomeGroup: (
      state,
      action: PayloadAction<OutcomeGroup | undefined>
    ) => {
      state.outcomeGroup = action.payload;
    },
  },
  extraReducers(builder) {
    builder
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
      .addCase(addUserOutcomeGroupAction.pending, state => {
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
        state.action = RequestActions.ADD;
      })
      .addCase(addUserOutcomeGroupAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const copy: OutcomeGroup[] = state.outcomeGroups || [];
          const currentOutcomeGroup = action.payload.entity as
            | OutcomeGroup
            | undefined;
          if (currentOutcomeGroup) {
            copy.push(currentOutcomeGroup);
            state.outcomeGroups = copy;
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(addUserOutcomeGroupAction.rejected, state => {
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
          const copy = outcomes ? [...outcomes] : [];
          const outcomeIndex = copy.findIndex(o => o.id === id);
          copy.splice(outcomeIndex, 1);
          state.outcomes = copy;
          state.requestStatus = RequestStatus.SUCCEEDED;
        }
      })
      .addCase(deleteUserOutcomeAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(deleteUserOutcomeGroupAction.pending, state => {
        state.action = RequestActions.DELETE;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(deleteUserOutcomeGroupAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200 && action.payload.entityId) {
          state.error = false;
          const { outcomeGroups, outcomes } = state;
          const groupId = action.payload.entityId;
          if (outcomes) {
            const outcomesCopy = [
              ...outcomes.filter(o => o.groupId !== groupId),
            ];
            state.outcomes = [...outcomesCopy];
          }
          const copy = outcomeGroups ? [...outcomeGroups] : [];
          const outcomeGroupIndex = copy.findIndex(p => p.id === groupId);
          copy.splice(outcomeGroupIndex, 1);
          state.outcomeGroups = copy;
          state.requestStatus = RequestStatus.SUCCEEDED;
        }
      })
      .addCase(deleteUserOutcomeGroupAction.rejected, state => {
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
            state.outcomes = [...outcomesCopy, ...respOutcomes];
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(getUserOutcomesAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(getUserOutcomeGroupsAction.pending, state => {
        state.action = RequestActions.GET_USER_ITEMS;
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(getUserOutcomeGroupsAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const respOutcomeGroups = action.payload.entity as
            | OutcomeGroup[]
            | undefined;
          if (respOutcomeGroups) {
            state.outcomeGroups = [...respOutcomeGroups];
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(getUserOutcomeGroupsAction.rejected, state => {
        state.error = true;
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
      .addCase(setUserOutcomeGroupAction.pending, state => {
        state.action = RequestActions.UPDATE;
        state.error = false;
        state.outcomeGroup = undefined;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(setUserOutcomeGroupAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        const copy: OutcomeGroup[] = state.outcomeGroups || [];
        if (action.payload.status === 200) {
          state.error = false;
          const currentOutcomeGroup = action.payload.entity as
            | OutcomeGroup
            | undefined;
          if (currentOutcomeGroup) {
            const outcomeGroupIndex = copy.findIndex(
              p => p.id === currentOutcomeGroup.id
            );
            if (outcomeGroupIndex > -1) {
              copy.splice(outcomeGroupIndex, 1, currentOutcomeGroup);
              state.outcomeGroups = copy;
            }
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(setUserOutcomeGroupAction.rejected, state => {
        state.error = true;
        state.outcomeGroup = undefined;
        state.requestStatus = RequestStatus.FAILED;
      });
  },
});

export const { finishRequest, setError, setOutcome, setOutcomeGroup } =
  outcomeGroupSlice.actions;

const getOutcomeGroupState = (state: RootState) => state.outcomeGroup;

export const selectAction = createSelector(getOutcomeGroupState, o => o.action);
export const selectOutcome = createSelector(
  getOutcomeGroupState,
  p => p.outcome
);
export const selectOutcomeGroups = createSelector(getOutcomeGroupState, o => {
  const sortedGroups = (o.outcomeGroups ? [...o.outcomeGroups] : [])?.sort(
    (a: OutcomeGroup, b: OutcomeGroup) => a.name.localeCompare(b.name)
  );
  if (sortedGroups.length < 1) return undefined;
  return sortedGroups;
});
export const selectOutcomesByGroupId = (outcomeGroupId: string) =>
  createSelector(getOutcomeGroupState, p => {
    const filteredOutcomes = (p.outcomes ? [...p.outcomes] : [])
      ?.filter(o => o.groupId === outcomeGroupId)
      ?.sort(
        (a: Outcome, b: Outcome) => (a.outcomeDate || 0) - (b.outcomeDate || 0)
      );
    if (filteredOutcomes.length < 1) return undefined;
    return filteredOutcomes;
  });
export const selectError = createSelector(getOutcomeGroupState, o => o.error);
export const selectOutcomeGroup = createSelector(
  getOutcomeGroupState,
  o => o.outcomeGroup
);
export const selectOutcomeGroupById = (outcomeGroupId: string) =>
  createSelector(getOutcomeGroupState, o =>
    o.outcomeGroups?.find(o => o.id === outcomeGroupId)
  );
export const selectRequestStatus = createSelector(
  getOutcomeGroupState,
  o => o.requestStatus
);

export default outcomeGroupSlice.reducer;
