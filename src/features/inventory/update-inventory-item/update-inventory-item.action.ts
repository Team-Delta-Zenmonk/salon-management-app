import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateInventoryItemService } from "./update-inventory-item.service";
import { updateInventoryItemType } from "./update-inventory-item.type";

export const updateInventoryItemAction = createAsyncThunk(
  updateInventoryItemType,
  async (payload: { uuid: string; data: any }, thunkAPI) => {
    try {
      const res = await updateInventoryItemService(payload.uuid, payload.data);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to update inventory item",
      });
    }
  }
);
