import { createAsyncThunk } from "@reduxjs/toolkit";
import { createInventoryItemService } from "./create-inventory-item.service";
import { createInventoryItemType } from "./create-inventory-item.type";

export const createInventoryItemAction = createAsyncThunk(
  createInventoryItemType,
  async (data: any, thunkAPI) => {
    try {
      const res = await createInventoryItemService(data);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to create inventory item",
      });
    }
  }
);
