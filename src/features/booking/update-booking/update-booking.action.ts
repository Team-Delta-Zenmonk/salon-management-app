import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateBookingService, type UpdateBookingPayload } from "./update-booking.service";
import { updateBookingType } from "./update-booking.type";

export const updateBookingAction = createAsyncThunk(
  updateBookingType,
  async (payload: UpdateBookingPayload, { rejectWithValue }) => {
    try {
      const response = await updateBookingService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  },
);
