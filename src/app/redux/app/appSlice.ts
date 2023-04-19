import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { login, logout } from './appActions';

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

const initialState: AppState = {
  menuCollapsed: true,
  error: '',
  loading: true,
  user: undefined,
};

const appSlice = createSlice({
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
export default appSlice.reducer;
