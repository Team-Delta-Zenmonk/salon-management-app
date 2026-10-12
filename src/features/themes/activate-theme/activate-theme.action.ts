import { createAsyncThunk } from "@reduxjs/toolkit";
import { activateStorefrontThemeService } from "./activate-theme.service";
import { activateThemeType } from "./activate-theme.type";
import type { ActivateThemeResponse } from "../types";

export const activateThemeAction = createAsyncThunk<
  ActivateThemeResponse,
  string,
  { rejectValue: { message: string } }
>(
  activateThemeType,
  async (themeUuid: string, { rejectWithValue }) => {
    try {
      const response = await activateStorefrontThemeService(themeUuid);
      return response;
    } catch (error: any) {
      return rejectWithValue({
        message: error?.response?.data?.message || "Failed to activate storefront theme",
      });
    }
  }
);

