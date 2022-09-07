/* eslint-disable @typescript-eslint/ban-types */
import { AsyncThunk, createAsyncThunk } from '@reduxjs/toolkit';
import getDbFunctions from '../../api/generic';
import { BaseResponse } from '../../models/api/base';
import { GenericItem } from '../../models/util';
import { AppDispatch, RootState } from '../store';

export interface AsyncThunkConfig {
  state: RootState;
  dispatch: AppDispatch;
}

export interface InputParams<T> {
  entity?: T;
  entityId?: string;
  parentItemId?: string;
  userId?: string;
}

interface FetchActions<T> {
  addUserItemAction: AsyncThunk<BaseResponse<T>, T, {}>;
  deleteUserItemAction: AsyncThunk<BaseResponse<T>, string, {}>;
  getUserItemsAction: AsyncThunk<BaseResponse<T>, InputParams<T>, {}>;
  getUserItemByIdAction: AsyncThunk<BaseResponse<T>, string, {}>;
  setUserItemAction: AsyncThunk<BaseResponse<T>, T, {}>;
}

export function getExtraReducers<T extends GenericItem>(
  collectionName: string
): FetchActions<T> {
  const { addItem, deleteUserItem, getUserItemById, getUserItems, setItem } =
    getDbFunctions<T>(collectionName);

  const addUserItemAction = createAsyncThunk<
    BaseResponse<T>,
    T,
    AsyncThunkConfig
  >(`${collectionName}/addUser${collectionName}`, async (item: T) => {
    return await addItem(item);
  });

  const deleteUserItemAction = createAsyncThunk<
    BaseResponse<T>,
    string,
    AsyncThunkConfig
  >(`${collectionName}/deleteUser${collectionName}`, async (itemId: string) => {
    return await deleteUserItem(itemId);
  });

  const getUserItemByIdAction = createAsyncThunk<
    BaseResponse<T>,
    string,
    AsyncThunkConfig
  >(
    `${collectionName}/getUser${collectionName}ById`,
    async (itemId: string) => {
      return await getUserItemById(itemId);
    }
  );

  const getUserItemsAction = createAsyncThunk<
    BaseResponse<T>,
    InputParams<T>,
    AsyncThunkConfig
  >(
    `${collectionName}/fetchAllUser${collectionName}`,
    async (params: InputParams<T>) => {
      return await getUserItems(params.userId || '');
    }
  );

  const setUserItemAction = createAsyncThunk<
    BaseResponse<T>,
    T,
    AsyncThunkConfig
  >(`${collectionName}/setUser${collectionName}`, async (item: T) => {
    return await setItem(item);
  });

  return {
    addUserItemAction,
    deleteUserItemAction,
    getUserItemByIdAction,
    getUserItemsAction,
    setUserItemAction,
  };
}
