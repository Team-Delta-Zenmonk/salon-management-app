import { createSlice } from "@reduxjs/toolkit";
import { listInventoryItemsAction } from "./list-inventory-items/list-inventory-items.action";
import type { InventoryItemCategory } from "./items-category.slice";

export interface InventoryItem {
  id: number;
  uuid: string;
  salon_id: number;
  category_id: number;
  name: string;
  brand: string | null;
  logo: string | null;
  variant_name: string | null;
  item_type?: "product" | "material" | "equipment";
  unit: string | null;
  unit_price: string;
  current_stock: number;
  min_stock_level: number;
  category: InventoryItemCategory;
}

export interface InventoryItemState {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
}

const initialState: InventoryItemState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
};

export const inventoryItemSlice = createSlice({
  name: "inventoryItem",
  initialState,
  reducers: {
    appendStock(state, action) {
      const { data, total, page, limit } = action.payload;
      const existingUuids = new Set(state.data.map((item) => item.uuid));
      const newItems = data.filter((item: InventoryItem) => !existingUuids.has(item.uuid));

      state.data = [...state.data, ...newItems];
      state.total = total;
      state.page = page;
      state.limit = limit;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listInventoryItemsAction.fulfilled, (state, action) => {
      const { data, total, page, limit } = action.payload;

      state.data = data;
      state.total = total;
      state.page = page;
      state.limit = limit;
    });
  },
});

export const { appendStock } = inventoryItemSlice.actions;
export default inventoryItemSlice.reducer;
