import { createAsyncThunk } from "@reduxjs/toolkit";
import { getBookingsService } from "../booking/get-bookings/get-bookings.service";
import { getDashboardAnalyticsType } from "./dashboard.type";
import {
  getDashboardQueryDateRange,
  composeDashboardViewModel,
  type DashboardViewModel,
} from "../../pages/dashboard/utils/dashboard-view.model";

export const getDashboardAnalyticsAction = createAsyncThunk<
  { timeRange: "7d" | "30d"; viewModel: DashboardViewModel; rawBookings: any[] },
  "7d" | "30d"
>(getDashboardAnalyticsType, async (timeRange, thunkAPI) => {
  try {
    const { startDateStr, endDateStr } = getDashboardQueryDateRange(timeRange);
    const res: any = await getBookingsService({
      start_date: startDateStr,
      end_date: endDateStr,
      view: "calendar",
    });
    const rawBookings: any[] = Array.isArray(res) ? res : res?.data || [];
    const viewModel = composeDashboardViewModel(rawBookings, timeRange);
    return { timeRange, viewModel, rawBookings };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.message || "Failed to load dashboard analytics"
    );
  }
});
