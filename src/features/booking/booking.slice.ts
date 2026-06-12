import { createSlice } from "@reduxjs/toolkit";
import { type BookingStatus } from "../../common/enums/booking-status.enum";
import { type BookingSource } from "../../common/enums/booking-source.enum";
import { listBookingsAction } from "./get-bookings/get-bookings.action";
import { createBookingAction } from "./create-booking/create-booking.action";
import { updateBookingAction } from "./update-booking/update-booking.action";
import { deleteBookingAction } from "./delete-booking/delete-booking.action";

export interface BookingService {
  id: number;
  uuid: string;
  booking_id: number;
  service_id: number;
  staff_id: number;
  sequence: number;
  offset_minutes: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  price: number;
  service?: {
    name: string;
    uuid: string;
  };
  staff?: {
    first_name: string;
    last_name?: string;
    uuid: string;
  };
}

export interface Booking {
  id: number;
  uuid: string;
  customer_id?: number | null;
  salon_id: number;
  total_price: number;
  total_duration: number;
  status: BookingStatus;
  booking_start_time: string;
  booking_end_time: string;
  booking_date: string;
  created_by: BookingSource;
  admin_booking?: {
    name: string;
    phone: string;
    email?: string;
  };
  customer?: {
    name: string;
    email: string;
  };
  booking_services: BookingService[];
}

export interface BookingState {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
}

const initialState: BookingState = {
  data: [],
  total: 0,
  page: 1,
  limit: 12,
  loading: false,
};

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetBookingState(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
      state.limit = 12;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listBookingsAction.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(listBookingsAction.fulfilled, (state, action) => {
      const { data, pagination } = action.payload;
      state.data = data;
      if (pagination) {
        state.total = pagination.total || 0;
        state.page = pagination.page || 1;
        state.limit = pagination.limit || 12;
      }
      state.loading = false;
    });
    builder.addCase(listBookingsAction.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(createBookingAction.fulfilled, (state, action) => {
      const createdBooking = action.payload.data;
      const bookingExists = state.data.some((booking) => booking.uuid === createdBooking.uuid);

      if (!bookingExists) {
        state.data.unshift(createdBooking);
        state.total += 1;
      }
    });

    builder.addCase(updateBookingAction.fulfilled, (state, action) => {
      const index = state.data.findIndex((b) => b.uuid === action.payload.data.uuid);
      if (index !== -1) {
        state.data[index] = action.payload.data;
      }
    });

    builder.addCase(deleteBookingAction.fulfilled, (state, action) => {
      const previousLength = state.data.length;
      state.data = state.data.filter((b) => b.uuid !== action.meta.arg.uuid);

      if (state.data.length < previousLength) {
        state.total = Math.max(0, state.total - 1);
      }
    });
  },
});

export const { resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
