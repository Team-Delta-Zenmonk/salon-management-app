import { createAsyncThunk } from "@reduxjs/toolkit";
import { verifySalon, type VerifySalonPayload } from "./verify-salon.service";
import { verifySalonType } from "./verify-salon.type";

export const verifySalonAction = createAsyncThunk(
  verifySalonType,
  async (payload: VerifySalonPayload, thunkAPI) => {
    try {
      const res = await verifySalon(payload);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);
