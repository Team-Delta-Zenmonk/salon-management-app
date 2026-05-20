import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateSalonProfile } from "../profile.service";

export const updateSalonProfileAction = createAsyncThunk(
    "auth/updateSalonProfile",
    async (payload: any, thunkAPI) => {
        try {
            const res = await updateSalonProfile(payload);
            return res;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data || "Failed to update profile");
        }
    }
);