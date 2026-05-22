import { createAsyncThunk } from "@reduxjs/toolkit";
import { getInventoryLogService } from "./get-inventory-log.service";
import { getInventoryLogType } from "./get-inventory-log.type";

export const getInventoryLogAction = createAsyncThunk(
  getInventoryLogType,
  async (uuid: string, thunkAPI) => {
    try {
      const res = await getInventoryLogService(uuid);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch inventory log",
      });
    }
  }
);
