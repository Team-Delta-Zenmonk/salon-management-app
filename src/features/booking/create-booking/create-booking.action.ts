import { createAsyncThunk } from "@reduxjs/toolkit";
import { createBookingService, type CreateBookingPayload } from "./create-booking.service";
import { createBookingType } from "./create-booking.type";

export const createBookingAction = createAsyncThunk(
  createBookingType,
  async (payload: CreateBookingPayload, { rejectWithValue }) => {
    try {
      const response = await createBookingService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);
