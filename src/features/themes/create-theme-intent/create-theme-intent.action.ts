import { createAsyncThunk } from "@reduxjs/toolkit";
import { createThemePaymentIntentService } from "./create-theme-intent.service";
import { createThemeIntentType } from "./create-theme-intent.type";
import type { ThemePaymentIntentResponse } from "../types";

export const createThemeIntentAction = createAsyncThunk<
  ThemePaymentIntentResponse,
  string,
  { rejectValue: { message: string } }
>(
  createThemeIntentType,
  async (themeUuid: string, { rejectWithValue }) => {
    try {
      const response = await createThemePaymentIntentService(themeUuid);
      return response;
    } catch (error: any) {
      return rejectWithValue({
        message: error?.response?.data?.message || "Failed to initiate payment intent",
      });
    }
  }
);

