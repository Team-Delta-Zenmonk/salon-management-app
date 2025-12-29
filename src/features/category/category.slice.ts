import { createSlice } from "@reduxjs/toolkit";
import { listCategoriesAction } from "./list-categories/list-categories.action";
import { updateCategoryAction } from "./update-category/update-category.action";
export interface Category {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  logo?: string;
  salon_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CategoriesState {
  data: Category[];
  total: number;
  page: number;
  limit: number;
  selectedCategory: Category | null;
}

const initialState: CategoriesState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
  selectedCategory: null,
};

export const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },
    resetCategories(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listCategoriesAction.fulfilled, (state, action) => {
      const { data, total, page, limit } = action.payload;
      if (page === 1) {
        state.data = data;
      } else {
        state.data = [...state.data, ...data];
      }

      state.total = total;
      state.page = page;
      state.limit = limit;
    });

    builder.addCase(updateCategoryAction.fulfilled, (state, { payload }) => {
      const index = state.data.findIndex((c) => c.uuid === payload.uuid);
      if (index !== -1) {
        state.data[index] = {
          ...state.data[index],
          ...payload.body,
        };
      }
    });
  },
});

export const { clearSelectedCategory, resetCategories } = categoriesSlice.actions;
export default categoriesSlice.reducer;
