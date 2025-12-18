import { createAsyncThunk } from "@reduxjs/toolkit";
import { listStaffType } from "./list-staff.type";
import { listStaffService, type ListStaffParams } from "./lsit-staff.service";

export const listStaffAction = createAsyncThunk(
  listStaffType,
  async (params: ListStaffParams | undefined, thunkAPI) => {
    try {
      return await listStaffService(params);
    } catch (err: any) {
      return thunkAPI.rejectWithValue({
        message: err?.response?.data?.message || "Unable to fetch staff",
      });
    }
  }
);
