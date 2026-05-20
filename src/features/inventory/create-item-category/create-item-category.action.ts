import { createAsyncThunk } from "@reduxjs/toolkit";
import { createItemCategoryService } from "./create-item-category.service";
import { createItemCategoryType } from "./create-item-category.type";

export const createItemCategoryAction = createAsyncThunk(
  createItemCategoryType,
  async (data: { name: string }, thunkAPI) => {
    try {
      const res = await createItemCategoryService(data);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to create item category",
      });
    }
  }
);
