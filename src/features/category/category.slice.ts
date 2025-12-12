import { createSlice } from "@reduxjs/toolkit";
import { createCategoryAction } from "./create-category/create-category.action";
import { listCategoriesAction } from "./list-categories/list-categories.action";
import { deleteCategoryAction } from "./delete-category/delete-category.action";
import { updateCategoryAction } from "./update-category/update-category.action";

export interface Category {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  logo?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoriesState {
  categories: Category[];
  selectedCategory: Category | null;
}

const initialState: CategoriesState = {
  categories: [],
  selectedCategory: null,
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listCategoriesAction.fulfilled, (state, action) => {
      state.categories = action.payload.rows;
    });
    builder.addCase(updateCategoryAction.fulfilled, (state, { payload }) => {
      const index = state.categories.findIndex((c) => c.uuid === payload.uuid);
      if (index !== -1) {
        state.categories[index] = {
          ...state.categories[index],
          ...payload.body,
        };
      }
    });
  },
});

export const { clearSelectedCategory } = categoriesSlice.actions;
export default categoriesSlice.reducer;
