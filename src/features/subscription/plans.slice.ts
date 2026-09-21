import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { axiosInstance } from "../../config/axios";
import type { SubscriptionPlan } from "@/common/enums/subscription-plan.enum";

export interface BackendPlan {
  id: SubscriptionPlan;
  name: string;
  amount: number;
  formatted_price: string;
  currency: string;
  billing_cycle: string;
  badge?: string;
  description: string;
}

export interface PlansState {
  plans: BackendPlan[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  plans: [],
  isLoading: false,
  error: null,
};

export const fetchSubscriptionPlans = createAsyncThunk<BackendPlan[], void, { rejectValue: string }>(
  "subscription/fetchSubscriptionPlans",
  async (_, thunkAPI) => {
    try {
      const res = await axiosInstance.get<{ plans: BackendPlan[] }>("/admin/plans");
      return res.data.plans;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch plans");
    }
  }
);

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
