import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteCategoryService } from "./delete-category.service";
import { deleteCategoryType } from "./delete-category.type";

export const deleteCategoryAction = createAsyncThunk(
  deleteCategoryType,
  async (uuid: string, thunkAPI) => {
    try {
      const res = await deleteCategoryService(uuid);
      return { uuid, ...res };
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Failed to delete category",
      });
    }
  }
);
