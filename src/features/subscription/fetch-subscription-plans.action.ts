import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getSubscriptionPlansService } from "./subscription-plans.service";
import type { BackendPlan } from "./plans.slice";

export const fetchSubscriptionPlans = createAsyncThunk<
  BackendPlan[],
  void,
  { rejectValue: string }
>("subscription/fetchSubscriptionPlans", async (_, thunkAPI) => {
  try {
    const plans = await getSubscriptionPlansService();
    return plans;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch plans"
      );
    }
    return thunkAPI.rejectWithValue("Failed to fetch plans");
  }
});
