import { createAsyncThunk } from "@reduxjs/toolkit";
import { getTransactions } from "./list-inventory-logs.service";
import { listInventoryLogsType } from "./list-inventory-logs.type";

export const listInventoryLogsAction = createAsyncThunk(
  listInventoryLogsType,
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      item_uuid?: string;
    } = {},
    thunkAPI
  ) => {
    try {
      const res = await getTransactions(params);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch inventory logs",
      });
    }
  }
);
