import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteBookingService, type DeleteBookingPayload } from "./delete-booking.service";
import { deleteBookingType } from "./delete-booking.type";

export const deleteBookingAction = createAsyncThunk(
  deleteBookingType,
  async (payload: DeleteBookingPayload, { rejectWithValue }) => {
    try {
      const response = await deleteBookingService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
