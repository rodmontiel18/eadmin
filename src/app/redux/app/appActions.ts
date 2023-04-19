import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { AsyncThunkConfig } from '../generic';
import { auth } from '../../../firebase/firebaseConfig';

interface LoginParams {
  email: string;
  password: string;
}

export const login = createAsyncThunk<
  UserCredential,
  LoginParams,
  AsyncThunkConfig
>('app/login', async (loginParams: LoginParams) => {
  const { email, password } = loginParams;
  return await signInWithEmailAndPassword(auth, email, password);
});

export const logout = createAsyncThunk<void, undefined, AsyncThunkConfig>(
  'app/logout',
  async () => {
    return await signOut(auth);
  }
);
