import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateServiceType } from "./update-service.type";
import { updateServiceService } from "./update-service.service";

export const updateServiceAction = createAsyncThunk(
  updateServiceType,
  async ({ uuid, body }: { uuid: string; body: any }, thunkAPI) => {
    try {
      await updateServiceService(uuid, body);
      return { uuid, body };
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message,
      });
    }
  }
);
