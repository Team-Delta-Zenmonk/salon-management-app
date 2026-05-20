import { createAsyncThunk } from "@reduxjs/toolkit";
import { getInventoryItemService } from "./get-inventory-item.service";
import { getInventoryItemType } from "./get-inventory-item.type";

export const getInventoryItemAction = createAsyncThunk(
  getInventoryItemType,
  async (uuid: string, thunkAPI) => {
    try {
      const res = await getInventoryItemService(uuid);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch inventory item",
      });
    }
  }
);
