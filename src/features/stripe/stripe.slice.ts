import { createSlice } from "@reduxjs/toolkit";
import { onboardStripeAction } from "./onboard-stripe/onboard-stripe.action";
import { getStripeDashboardLinkAction } from "./get-dashboard-link/get-dashboard-link.action";

export interface StripeState {
  isOnboarding: boolean;
  isLoadingDashboardLink: boolean;
  error: string | null;
}

const initialState: StripeState = {
  isOnboarding: false,
  isLoadingDashboardLink: false,
  error: null,
};

export const stripeSlice = createSlice({
  name: "stripe",
  initialState,
  reducers: {
    clearStripeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(onboardStripeAction.pending, (state) => {
        state.isOnboarding = true;
        state.error = null;
      })
      .addCase(onboardStripeAction.fulfilled, (state) => {
        state.isOnboarding = false;
      })
      .addCase(onboardStripeAction.rejected, (state, action) => {
        state.isOnboarding = false;
        state.error = (action.payload as string) || "Failed to onboard stripe";
      })
      .addCase(getStripeDashboardLinkAction.pending, (state) => {
        state.isLoadingDashboardLink = true;
        state.error = null;
      })
      .addCase(getStripeDashboardLinkAction.fulfilled, (state) => {
        state.isLoadingDashboardLink = false;
      })
      .addCase(getStripeDashboardLinkAction.rejected, (state, action) => {
        state.isLoadingDashboardLink = false;
        state.error = (action.payload as string) || "Failed to get dashboard link";
      });
  },
});

export const { clearStripeError } = stripeSlice.actions;
export default stripeSlice.reducer;
