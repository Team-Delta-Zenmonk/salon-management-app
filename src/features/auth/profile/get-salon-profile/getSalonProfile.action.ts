import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSalonProfile } from "./getSalonProfile.service";
import { getSalonProfileType } from "./get-salon-profile.type";

export const getSalonProfileAction = createAsyncThunk(
  getSalonProfileType,
  async (uuid: string, thunkAPI) => {
    try {
      const res = await getSalonProfile(uuid);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data || "Failed to fetch profile");
    }
  }
);

