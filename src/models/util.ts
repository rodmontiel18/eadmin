export enum RequestActions {
  ADD = 1,
  DELETE,
  GET_USER_ITEM,
  GET_USER_ITEMS,
  UPDATE,
  NONE,
}

export interface GenericItem {
  id: string;
  userId: string;
}
