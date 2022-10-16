import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

const genericDataConverter = <T>() => {
  const converter: FirestoreDataConverter<T> = {
    toFirestore(snapshot: T): DocumentData {
      return { ...snapshot } as DocumentData;
    },
    fromFirestore(docSnap: QueryDocumentSnapshot): T {
      return docSnap.data() as T;
    },
  };
  return converter;
};

export { genericDataConverter };
