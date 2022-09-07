import { GenericItem } from '../util';

export interface Category extends GenericItem {
  color: string;
  description: string;
  id: string;
  name: string;
  type?: CategoryType;
  userId: string;
}

export enum CategoryType {
  Income = 1,
  Outcomes,
}
