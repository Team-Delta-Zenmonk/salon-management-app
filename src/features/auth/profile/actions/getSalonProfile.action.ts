import { createAsyncThunk } from "@reduxjs/toolkit";
import { getSalonProfile } from "../profile.service";

export const getSalonProfileAction = createAsyncThunk(
  "auth/getSalonProfile",
  async (uuid: string, thunkAPI) => {
    try {
      const res = await getSalonProfile(uuid);
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data || "Failed to fetch profile");
    }
  }
);

