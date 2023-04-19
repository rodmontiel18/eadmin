import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RequestStatus } from '../../../models/api';
import { Outcome } from '../../../models/outcome';
import { OutcomeGroup } from '../../../models/outcomeGroup/OutcomeGroup';
import { RequestActions } from '../../../models/util';
import {
  addUserOutcomeAction,
  addUserOutcomeGroupAction,
  COLLECTION_NAME,
  deleteUserOutcomeAction,
  deleteUserOutcomeGroupAction,
  getUserOutcomeGroupsAction,
  getUserOutcomesAction,
  setUserOutcomeAction,
  setUserOutcomeGroupAction,
} from './outcomeGroupActions';

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
export default outcomeGroupSlice.reducer;
