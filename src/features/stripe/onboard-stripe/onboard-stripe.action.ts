import { createAsyncThunk } from "@reduxjs/toolkit";
import { onboardStripeService } from "./onboard-stripe.service";
import { onboardStripeType } from "./onboard-stripe.type";

export const onboardStripeAction = createAsyncThunk(
  onboardStripeType,
  async (_, thunkAPI) => {
    try {
      const res = await onboardStripeService();
      return res;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err?.response?.data || "Failed to generate Stripe onboarding link");
    }
  }
);
