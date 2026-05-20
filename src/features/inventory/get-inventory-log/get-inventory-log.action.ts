import { createAsyncThunk } from "@reduxjs/toolkit";
import { getInventoryLogService } from "./get-inventory-log.service";
import { getInventoryLogType } from "./get-inventory-log.type";

export const getInventoryLogAction = createAsyncThunk(
  getInventoryLogType,
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
      const res = await getInventoryLogService(params);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch inventory logs",
      });
    }
  }
);
