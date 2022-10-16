import {
  addDoc,
  doc,
  collection,
  CollectionReference,
  deleteDoc,
  getDocs,
  query,
  setDoc,
  where,
  getDoc,
  FirestoreDataConverter,
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { BaseResponse } from '../models/api/base';
import { GenericItem } from '../models/util';
import { genericDataConverter } from '../util/firestore';

interface GenericFunctions<T> {
  addItem: (item: T) => Promise<BaseResponse<T>>;
  deleteUserItem: (itemId: string) => Promise<BaseResponse<T>>;
  getUserItemById: (itemId: string) => Promise<BaseResponse<T>>;
  getUserItems: (userId: string) => Promise<BaseResponse<T>>;
  setItem: (item: T) => Promise<BaseResponse<T>>;
}

const getCollection = <T>(
  collectionName: string,
  converter?: FirestoreDataConverter<T>
): CollectionReference<T> => {
  return collection(db, collectionName).withConverter(
    converter || genericDataConverter<T>()
  );
};

const getDbFunctions = <T extends GenericItem>(
  collectionName: string,
  converter?: FirestoreDataConverter<T>
): GenericFunctions<T> => {
  const collection = getCollection<T>(collectionName, converter);

  const addItem = async (item: T): Promise<BaseResponse<T>> => {
    const resp: BaseResponse<T> = {
      error: '',
      status: 500,
    };
    try {
      const snapItem = await addDoc(collection, item);
      if (snapItem?.id) {
        resp.entity = { ...item, id: snapItem.id };
        resp.error = '';
        resp.status = 200;
      } else {
        resp.error = 'Not found';
        resp.status = 404;
      }
    } catch (error) {
      resp.error = `${error}`;
      console.error(error);
    }
    return resp;
  };

  const deleteUserItem = async (id: string): Promise<BaseResponse<T>> => {
    const resp: BaseResponse<T> = {
      error: '',
      status: 500,
    };
    try {
      await deleteDoc(doc(collection, id));
      resp.status = 200;
      resp.entityId = id;
    } catch (error) {
      console.error(error);
      resp.error = `${error}`;
    }
    return resp;
  };

  const getUserItemById = async (id: string): Promise<BaseResponse<T>> => {
    const response: BaseResponse<T> = {
      error: '',
      status: 500,
    };
    try {
      const itemSnap = await getDoc(doc(collection, id));
      if (itemSnap.exists()) {
        response.status = 200;
        response.entity = {
          ...itemSnap.data(),
          id: itemSnap.id,
        };
      } else {
        response.status = 404;
        response.error = 'Not found';
      }
    } catch (error) {
      console.error(error);
      response.error = `${error}`;
    }
    return response;
  };

  const getUserItems = async (userId: string): Promise<BaseResponse<T>> => {
    const response: BaseResponse<T> = {
      error: '',
      status: 500,
    };
    try {
      let items: T[] = [];
      const querySnap = await getDocs(
        query(collection, where('userId', '==', userId))
      );
      response.status = 200;
      items = [];
      if (!querySnap.empty) {
        querySnap.forEach(itemSnap => {
          if (itemSnap.exists())
            items.push({ ...itemSnap.data(), id: itemSnap.id });
        });
      }
      response.entity = items;
    } catch (error) {
      console.error(error);
      response.error = `${error}`;
    }
    return response;
  };

  const setItem = async (item: T): Promise<BaseResponse<T>> => {
    const response: BaseResponse<T> = {
      error: '',
      status: 500,
    };
    try {
      await setDoc(doc(collection, item.id), { ...item }, { merge: true });
      response.entity = { ...item };
      response.status = 200;
    } catch (error) {
      console.error(error);
      response.error = `${error}`;
    }
    return response;
  };

  return {
    addItem,
    deleteUserItem,
    getUserItemById,
    getUserItems,
    setItem,
  };
};

export default getDbFunctions;
