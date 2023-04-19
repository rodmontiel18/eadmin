import { createSelector } from '@reduxjs/toolkit';
import { Category } from '../../../models/category';
import { RootState } from '../../store';

const getCategoryState = (state: RootState) => state.category;

export const selectAction = createSelector(getCategoryState, c => c.action);
export const selectCategories = createSelector(getCategoryState, c => {
  const filteredCategories = (c.categories ? [...c.categories] : [])?.sort(
    (a: Category, b: Category) => a.name.localeCompare(b.name)
  );
  return filteredCategories;
});
export const selectError = createSelector(getCategoryState, c => c.error);
export const selectFormCategory = createSelector(
  getCategoryState,
  c => c.formCategory
);
export const selectRequestStatus = createSelector(
  getCategoryState,
  c => c.requestStatus
);
