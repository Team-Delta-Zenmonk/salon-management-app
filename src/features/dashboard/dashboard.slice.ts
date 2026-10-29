import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getDashboardAnalyticsAction } from "./dashboard.action";
import {
  INITIAL_DASHBOARD_VIEW_MODEL,
  type DashboardViewModel,
} from "../../pages/dashboard/utils/dashboard-view.model";

export interface DashboardState {
  timeRange: "7d" | "30d";
  viewModel: DashboardViewModel;
  todayBookings: any[];
  loading: boolean;
  isInitialLoaded: boolean;
  isVerifyingStripe: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  timeRange: "7d",
  viewModel: INITIAL_DASHBOARD_VIEW_MODEL,
  todayBookings: [],
  loading: false,
  isInitialLoaded: false,
  isVerifyingStripe: false,
  error: null,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setTimeRange(state, action: PayloadAction<"7d" | "30d">) {
      state.timeRange = action.payload;
    },
    setVerifyingStripe(state, action: PayloadAction<boolean>) {
      state.isVerifyingStripe = action.payload;
    },
    resetDashboard(state) {
      state.timeRange = "7d";
      state.viewModel = INITIAL_DASHBOARD_VIEW_MODEL;
      state.todayBookings = [];
      state.loading = false;
      state.isInitialLoaded = false;
      state.isVerifyingStripe = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDashboardAnalyticsAction.pending, (state) => {
        state.loading = true;
        state.isInitialLoaded = true;
        state.error = null;
      })
      .addCase(getDashboardAnalyticsAction.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.isInitialLoaded = true;
        state.timeRange = payload.timeRange;
        state.viewModel = payload.viewModel;
        const todayStr = new Date().toISOString().slice(0, 10);
        state.todayBookings = (payload.rawBookings || []).filter((b: any) => {
          const dateStr = b.booking_date ? String(b.booking_date).slice(0, 10) : "";
          return dateStr === todayStr;
        });
      })
      .addCase(getDashboardAnalyticsAction.rejected, (state, action) => {
        state.loading = false;
        state.isInitialLoaded = true;
        state.error = (action.payload as string) || "Failed to load dashboard analytics";
      });
  },
});

export const { setTimeRange, setVerifyingStripe, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
