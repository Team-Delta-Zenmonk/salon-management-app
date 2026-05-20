import { createAsyncThunk } from "@reduxjs/toolkit";
import { getItemCategories } from "./list-items-category.service";
import { listItemsCategoryType } from "./list-items-category.type";

export const fetchItemCategoriesAction = createAsyncThunk(
  listItemsCategoryType,
  async (params: { page?: number; limit?: number; search?: string } = {}, thunkAPI) => {
    try {
      const res = await getItemCategories(params);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch item categories",
      });
    }
  }
);
