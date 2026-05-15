import { createAsyncThunk } from "@reduxjs/toolkit";
import { getBookingsService, type GetBookingsParams } from "./get-bookings.service";
import { listBookingsType } from "./get-bookings.type";

export const listBookingsAction = createAsyncThunk(
  listBookingsType,
  async (params: GetBookingsParams, { rejectWithValue }) => {
    try {
      const response = await getBookingsService(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);
