import { createAsyncThunk } from "@reduxjs/toolkit";
import { listCategoriesService } from "./list-categories.service";
import { listCategoriesType } from "./list-categories.type";

export const listCategoriesAction = createAsyncThunk(listCategoriesType, async (_, thunkAPI) => {
  try {
    const res = await listCategoriesService();
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue({
      message: err?.response?.data?.message || "Unable to fetch categories",
    });
  }
});
