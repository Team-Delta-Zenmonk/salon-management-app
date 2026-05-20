import { createAsyncThunk } from "@reduxjs/toolkit";
import { decreaseStock } from "./decrease-items-stock.service";
import { decreaseStockType } from "./decrease-items-stock.type";

export const decreaseStockAction = createAsyncThunk(
  decreaseStockType,
  async (
    data: { uuid: string; currentStock: number; quantityToDecrease: number },
    thunkAPI
  ) => {
    try {
      const res = await decreaseStock(data.uuid, data.currentStock, data.quantityToDecrease);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to decrease stock",
      });
    }
  }
);
