import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateStaffType } from "./update-staff.type";
import { updateStaffService } from "./update-staff.service";

export const updateStaffAction = createAsyncThunk(
  updateStaffType,
  async ({ uuid, body }: { uuid: string; body: any }, thunkAPI) => {
    try {
      await updateStaffService(uuid, body);
      return { uuid, body };
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to update staff",
      });
    }
  }
);
