import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SubscriptionPlan } from "@/common/enums/subscription-plan.enum";
import { fetchSubscriptionPlans } from "./fetch-subscription-plans.action";
import type { ListPlansResponse } from "./subscription-plans.service";

export interface BackendPlan {
  id: number;
  uuid: string;
  code: SubscriptionPlan | string;
  name: string;
  amount: number;
  formatted_price: string;
  currency: string;
  billing_cycle: string;
  description: string;
  duration_days: number;
  is_active?: boolean;
}

export interface PlansState {
  plans: BackendPlan[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  plans: [],
  total: 0,
  page: 1,
  limit: 10,
  hasMore: false,
  isLoading: false,
  isInitialLoading: true,
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
    clearPlans(state) {
      state.plans = [];
      state.total = 0;
      state.page = 1;
      state.hasMore = false;
      state.isLoading = false;
      state.isInitialLoading = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptionPlans.pending, (state, { meta }) => {
        state.isLoading = true;
        state.error = null;
        const page = meta.arg?.page ?? 1;
        if (page === 1) {
          state.isInitialLoading = true;
        }
      })
      .addCase(fetchSubscriptionPlans.fulfilled, (state, action: PayloadAction<ListPlansResponse>) => {
        state.isLoading = false;
        state.isInitialLoading = false;
        const { plans, pagination } = action.payload;

        if (pagination.page === 1) {
          state.plans = plans;
        } else {
          const existingUuids = new Set(state.plans.map((p) => p.uuid));
          const newPlans = (plans || []).filter((p) => !existingUuids.has(p.uuid));
          state.plans = [...state.plans, ...newPlans];
        }

        state.total = pagination.total;
        state.page = pagination.page;
        state.limit = pagination.limit;
        state.hasMore = state.plans.length < pagination.total;
      })
      .addCase(fetchSubscriptionPlans.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialLoading = false;
        state.error = (action.payload as string) || "Failed to fetch plans";
      });
  },
});

export const { clearPlansError, clearPlans } = plansSlice.actions;
export default plansSlice.reducer;
