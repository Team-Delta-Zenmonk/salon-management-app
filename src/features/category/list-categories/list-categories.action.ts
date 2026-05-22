import { createAsyncThunk } from "@reduxjs/toolkit";
import { listCategoriesService, type ListCategoriesParams } from "./list-categories.service";
import { listCategoriesType } from "./list-categories.type";

export const listCategoriesAction = createAsyncThunk(
  listCategoriesType,
  async (params: ListCategoriesParams, thunkAPI) => {
    try {
      const res = await listCategoriesService(params);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch categories",
      });
    }
  }
);
