import { createSlice } from "@reduxjs/toolkit";
import { listInventoryLogsAction } from "./list-inventory-logs/list-inventory-logs.action";

export interface InventoryTransaction {
  id: number;
  uuid: string;
  salon_id: number;
  item_id: number;
  ordered_quantity: number;
  received_quantity: number;
  damaged_quantity: number;
  returned_quantity: number;
  bill_amount: string;
  ordered_date: string | null;
  received_date: string | null;
  created_at: string;
  updated_at: string;
  item: {
    uuid: string;
    name: string;
    brand: string;
    variant_name: string;
    unit: string | null;
  };
}

export interface InventoryLogState {
  data: InventoryTransaction[];
  total: number;
  page: number;
  limit: number;
}

const initialState: InventoryLogState = {
  data: [],
  total: 0,
  page: 1,
  limit: 10,
};

export const inventoryLogSlice = createSlice({
  name: "inventoryLog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(listInventoryLogsAction.fulfilled, (state, action) => {
      const { data, total, page, limit } = action.payload;

      if (page === 1) {
        state.data = data;
      } else {
        const existingUuids = new Set(state.data.map((item) => item.uuid));
        const newItems = data.filter((item: InventoryTransaction) => !existingUuids.has(item.uuid));
        state.data = [...state.data, ...newItems];
      }

      state.total = total;
      state.page = page;
      state.limit = limit;
    });
  },
});

export default inventoryLogSlice.reducer;
