import { Category } from '../../../models/category';
import { getExtraReducers } from '../generic';

export const {
  addUserItemAction: addUserCategoryAction,
  deleteUserItemAction: deleteUserCategoryAction,
  getUserItemsAction: getUserCategoriesAction,
  setUserItemAction: setUserCategoryAction,
} = getExtraReducers<Category>('category');
