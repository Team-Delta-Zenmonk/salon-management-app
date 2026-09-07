import { createAsyncThunk } from "@reduxjs/toolkit";
import { collectRemainingPaymentService, type CollectRemainingPaymentPayload } from "./collect-remaining-payment.service";
import { collectRemainingPaymentType } from "./collect-remaining-payment.type";

export const collectRemainingPaymentAction = createAsyncThunk(
  collectRemainingPaymentType,
  async (payload: CollectRemainingPaymentPayload, { rejectWithValue }) => {
    try {
      const response = await collectRemainingPaymentService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
