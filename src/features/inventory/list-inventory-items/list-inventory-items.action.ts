import { createAsyncThunk } from "@reduxjs/toolkit";
import { listInventoryItemsService } from "./list-inventory-items.service";
import { listInventoryItemsType } from "./list-inventory-items.type";

export const listInventoryItemsAction = createAsyncThunk(
  listInventoryItemsType,
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sort_by?: string;
      sort_order?: "ASC" | "DESC";
      category_id?: string;
      item_type?: string;
    },
    thunkAPI
  ) => {
    try {
      const res = await listInventoryItemsService(params);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch inventory items",
      });
    }
  }
);
