import { createAsyncThunk } from "@reduxjs/toolkit";
import { listStaffService, type ListStaffParams } from "./list-staff.service";
import { listStaffType } from "./list-staff.type";

export const listStaffAction = createAsyncThunk(listStaffType, async (params: ListStaffParams = {}, thunkAPI) => {
  try {
    const res = await listStaffService(params);
    return res;
  } catch (err: any) {
    return thunkAPI.rejectWithValue({
      message: err?.response?.data?.message || "Unable to fetch staff",
    });
  }
});
