import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RequestStatus } from '../../../models/api';
import { Category } from '../../../models/category';
import { RootState } from '../../store';
import { getExtraReducers } from '../generic';

interface CategoryState {
  action:
    | 'addCategory'
    | 'deleteCategory'
    | 'getCategories'
    | 'none'
    | 'updateCategory';
  categories: Category[] | undefined;
  error: boolean;
  formCategory: Category | undefined;
  requestStatus: RequestStatus;
}

const initialState: CategoryState = {
  action: 'none',
  categories: undefined,
  error: false,
  formCategory: undefined,
  requestStatus: RequestStatus.IDLE,
};

export const {
  addUserItemAction: addUserCategoryAction,
  deleteUserItemAction: deleteUserCategoryAction,
  getUserItemsAction: getUserCategoriesAction,
  setUserItemAction: setUserCategoryAction,
} = getExtraReducers<Category>('category');

export const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    finishRequest: state => {
      state.action = 'none';
      state.requestStatus = RequestStatus.IDLE;
      state.error = false;
    },
    setError: (state, action: PayloadAction<boolean>) => {
      state.error = action.payload;
    },
    setFormCategoryAction: (
      state,
      action: PayloadAction<Category | undefined>
    ) => {
      state.formCategory = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(addUserCategoryAction.pending, state => {
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
        state.action = 'addCategory';
      })
      .addCase(addUserCategoryAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const copyCats: Category[] = state.categories || [];
          const category = action.payload.entity as Category | undefined;
          if (category) {
            copyCats.push(category);
            state.categories = copyCats;
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(addUserCategoryAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(getUserCategoriesAction.pending, state => {
        state.action = 'getCategories';
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(getUserCategoriesAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200) {
          state.error = false;
          const respCategories = action.payload.entity as
            | Category[]
            | undefined;
          if (respCategories) {
            state.categories = [...respCategories];
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(getUserCategoriesAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(setUserCategoryAction.pending, state => {
        state.action = 'updateCategory';
        state.error = false;
        state.formCategory = undefined;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(setUserCategoryAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        const copyCats: Category[] = state.categories || [];
        if (action.payload.status === 200) {
          state.error = false;
          const currentCategory = action.payload.entity as Category | undefined;
          if (currentCategory) {
            const categoryIndex = copyCats.findIndex(
              c => c.id === currentCategory.id
            );
            if (categoryIndex > -1) {
              copyCats.splice(categoryIndex, 1, currentCategory);
              state.categories = copyCats;
            }
            state.requestStatus = RequestStatus.SUCCEEDED;
          }
        }
      })
      .addCase(setUserCategoryAction.rejected, state => {
        state.error = true;
        state.formCategory = undefined;
        state.requestStatus = RequestStatus.FAILED;
      })
      .addCase(deleteUserCategoryAction.pending, state => {
        state.action = 'deleteCategory';
        state.error = false;
        state.requestStatus = RequestStatus.PENDING;
      })
      .addCase(deleteUserCategoryAction.fulfilled, (state, action) => {
        state.requestStatus = RequestStatus.FAILED;
        state.error = true;
        if (action.payload.status === 200 && action.payload.entityId) {
          state.error = false;
          const { categories } = state;
          const id = action.payload.entityId;
          const categoriesClone = categories ? [...categories] : [];
          const catIndex = categoriesClone.findIndex(c => c.id === id);
          categoriesClone.splice(catIndex, 1);
          state.categories = categoriesClone;
          state.requestStatus = RequestStatus.SUCCEEDED;
        }
      })
      .addCase(deleteUserCategoryAction.rejected, state => {
        state.error = true;
        state.requestStatus = RequestStatus.FAILED;
      });
  },
});

export const { finishRequest, setError, setFormCategoryAction } =
  categorySlice.actions;

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

export default categorySlice.reducer;
