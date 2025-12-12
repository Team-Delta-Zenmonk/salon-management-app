import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateCategoryService, type UpdateCategoryBody } from "./update-category.service";
import { updateCategoryType } from "./update-category.type";

export interface UpdateCategoryPayload {
  uuid: string;
  body: UpdateCategoryBody;
}

export const updateCategoryAction = createAsyncThunk(
  updateCategoryType,
  async (payload: UpdateCategoryPayload, thunkAPI) => {
    const { uuid, body } = payload;
    try {
      const res = await updateCategoryService(uuid, body);
      return { uuid, body, message: res.message };
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message,
      });
    }
  }
);
