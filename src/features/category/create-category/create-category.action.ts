import { createAsyncThunk } from "@reduxjs/toolkit";
import { createCategoryService, type CreateCategoryPayload } from "./create-categories.service";
import { createCategoryType } from "./create-categories.type";


export const createCategoryAction = createAsyncThunk(
  createCategoryType,
  async (payload: CreateCategoryPayload, thunkAPI) => {
    try {
      const res = await createCategoryService(payload);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to create category",
      });
    }
  }
);
