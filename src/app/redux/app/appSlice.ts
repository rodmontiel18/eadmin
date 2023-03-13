import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from 'firebase/auth';
import { auth } from '../../../firebase/firebaseConfig';
import { RootState } from '../../store';
import { AsyncThunkConfig } from '../generic';

export interface UserType {
  email: string | null;
  displayName: string | null;
  uid: string | null;
}

export interface AppState {
  menuCollapsed: boolean;
  error: string;
  loading: boolean;
  user: UserType | undefined;
}

interface LoginParams {
  email: string;
  password: string;
}

const initialState: AppState = {
  menuCollapsed: true,
  error: '',
  loading: true,
  user: undefined,
};

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

export const appSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setUser: (state, action: PayloadAction<UserType>) => {
      state.user = action.payload;
    },
    setMenuCollapsed: (state, action: PayloadAction<boolean>) => {
      state.menuCollapsed = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.error = '';
        state.loading = true;
        state.user = undefined;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        const {
          user: { displayName, email, uid },
        } = action.payload;
        state.user = {
          displayName,
          email,
          uid,
        };
      })
      .addCase(login.rejected, state => {
        state.error = 'An error has ocurred';
        state.loading = false;
        state.user = undefined;
      })
      .addCase(logout.pending, state => {
        state.error = '';
        state.loading = true;
      })
      .addCase(logout.fulfilled, state => {
        state.loading = false;
        state.user = undefined;
      })
      .addCase(logout.rejected, state => {
        state.error = 'An error has ocurred';
        state.loading = false;
      });
  },
});

export const { setLoading, setMenuCollapsed, setUser } = appSlice.actions;

export const selectError = (state: RootState) => state.app.error;
export const selectLoading = (state: RootState) => state.app.loading;
export const selectMenuCollapsed = (state: RootState) =>
  state.app.menuCollapsed;
export const selectUser = (state: RootState) => state.app.user;

export default appSlice.reducer;
