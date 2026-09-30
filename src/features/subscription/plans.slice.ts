import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SubscriptionPlan } from "@/common/enums/subscription-plan.enum";
import { fetchSubscriptionPlans } from "./fetch-subscription-plans.action";

export interface BackendPlan {
  id: SubscriptionPlan;
  name: string;
  amount: number;
  formatted_price: string;
  currency: string;
  billing_cycle: string;
  description: string;
  duration_days: number;
}

export interface PlansState {
  plans: BackendPlan[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  plans: [],
  isLoading: true,
  error: null,
};

export { fetchSubscriptionPlans };

export const plansSlice = createSlice({
  name: "plans",
  initialState,
  reducers: {
    clearPlansError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action: PayloadAction<BackendPlan[]>) => {
        state.isLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Failed to fetch plans";
      });
  },
});

export const { clearPlansError } = plansSlice.actions;
export default plansSlice.reducer;
