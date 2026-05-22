import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateSalonProfile } from "./update-salon-profile.service";
import { updateSalonProfileType } from "./update-salon-profile.type";

export const updateSalonProfileAction = createAsyncThunk(
    updateSalonProfileType,
    async (payload: any, thunkAPI) => {
        try {
            const res = await updateSalonProfile(payload);
            return res;
        } catch (err: any) {
            return thunkAPI.rejectWithValue(err?.response?.data || "Failed to update profile");
        }
    }
);