import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../store';
const getAppState = (state: RootState) => state.app;

export const selectError = createSelector(getAppState, s => s.error);
export const selectLoading = createSelector(getAppState, s => s.loading);
export const selectMenuCollapsed = createSelector(
  getAppState,
  s => s.menuCollapsed
);
export const selectUser = createSelector(getAppState, s => s.user);
