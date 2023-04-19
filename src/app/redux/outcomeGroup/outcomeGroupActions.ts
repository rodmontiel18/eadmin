import { createAsyncThunk } from '@reduxjs/toolkit';
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
import { BaseResponse } from '../../../models/api/base';
import { Outcome } from '../../../models/outcome';
import { OutcomeGroup } from '../../../models/outcomeGroup/OutcomeGroup';
import { genericDataConverter } from '../../../util/firestore';
import { AsyncThunkConfig, getExtraReducers, InputParams } from '../generic';

export const COLLECTION_NAME = 'outcomeGroup';
export const OUTCOME_COLLECTION_NAME = 'outcome';

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
