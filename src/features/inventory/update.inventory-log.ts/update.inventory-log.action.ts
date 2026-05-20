import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateInventoryLogService } from "./update.inventory-log.service";
import { updateInventoryLogType } from "./update.inventory-log.type";

export const updateInventoryLogAction = createAsyncThunk(
  updateInventoryLogType,
  async (payload: { uuid: string; data: any }, thunkAPI) => {
    try {
      const res = await updateInventoryLogService(payload.uuid, payload.data);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to update inventory log",
      });
    }
  }
);
