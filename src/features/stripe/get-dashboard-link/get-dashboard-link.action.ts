import { createAsyncThunk } from "@reduxjs/toolkit";
import { getStripeDashboardLinkService } from "./get-dashboard-link.service";
import { getDashboardLinkType } from "./get-dashboard-link.type";

export const getStripeDashboardLinkAction = createAsyncThunk(
  getDashboardLinkType,
  async (_, thunkAPI) => {
    try {
      const res = await getStripeDashboardLinkService();
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data || "Failed to generate Stripe dashboard link");
    }
  }
);
