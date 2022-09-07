import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

const genericDataConverter = <T>() => ({
  toFirestore(snapshot: T): DocumentData {
    return { ...snapshot };
  },
  fromFirestore(docSnap: QueryDocumentSnapshot): T {
    return docSnap.data() as T;
  },
});

export { genericDataConverter };
