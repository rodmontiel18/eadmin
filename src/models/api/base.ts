export interface BaseResponse<T> {
  status: number;
  error: string;
  entity?: T | T[];
  entityId?: string;
  parentEntityId?: string;
}
