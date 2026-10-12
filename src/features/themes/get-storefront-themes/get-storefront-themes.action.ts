import { createAsyncThunk } from "@reduxjs/toolkit";
import { getStorefrontThemesService } from "./get-storefront-themes.service";
import { getStorefrontThemesType } from "./get-storefront-themes.type";
import type { StorefrontTheme } from "../types";

export const getStorefrontThemesAction = createAsyncThunk<
  StorefrontTheme[],
  void,
  { rejectValue: { message: string } }
>(
  getStorefrontThemesType,
  async (_, { rejectWithValue }) => {
    try {
      const response = await getStorefrontThemesService();
      return response;
    } catch (error: any) {
      return rejectWithValue({
        message: error?.response?.data?.message || "Failed to fetch storefront themes",
      });
    }
  }
);

