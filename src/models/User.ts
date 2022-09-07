import { User as AuthUser } from 'firebase/auth';

export interface ShortUser {
  birthday: number;
  id: string;
  lastname: string;
  name: string;
}

export type User = ShortUser & AuthUser;
