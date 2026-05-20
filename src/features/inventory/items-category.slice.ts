import { createSlice } from "@reduxjs/toolkit";
import { fetchItemCategoriesAction } from "./list-items-category/list-items-category.action";
import type { ItemCategory } from "./types/category.type";

export interface InventoryItemCategory {
  uuid: string;
  name: string;
  item_type: string;
}

export interface ItemsCategoryState {
  data: ItemCategory[];
  total: number;
  page: number;
  limit: number;
}

const initialState: ItemsCategoryState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
};

export const itemsCategorySlice = createSlice({
  name: "itemsCategory",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchItemCategoriesAction.fulfilled, (state, action) => {
      const { data, total, page, limit } = action.payload;

      if (page === 1) {
        state.data = data;
      } else {
        const existingUuids = new Set(state.data.map((category) => category.uuid));
        const newItems = data.filter((item: ItemCategory) => !existingUuids.has(item.uuid));
        state.data = [...state.data, ...newItems];
      }

      state.total = total;
      state.page = page;
      state.limit = limit;
    });
  },
});

export default itemsCategorySlice.reducer;
