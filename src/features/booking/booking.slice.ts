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
}

const initialState: BookingState = {
  data: [],
  total: 0,
  page: 1,
  limit: 50,
};

export const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    resetBookingState(state) {
      state.data = [];
      state.total = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(listBookingsAction.fulfilled, (state, action) => {
      state.data = action.payload;
    });

    builder.addCase(createBookingAction.fulfilled, (state, action) => {
      state.data.unshift(action.payload.data);
    });

    builder.addCase(updateBookingAction.fulfilled, (state, action) => {
      const index = state.data.findIndex((b) => b.uuid === action.payload.data.uuid);
      if (index !== -1) {
        state.data[index] = action.payload.data;
      }
    });

    builder.addCase(deleteBookingAction.fulfilled, (state, action) => {
      state.data = state.data.filter((b) => b.uuid !== action.meta.arg.uuid);
    });
  },
});

export const { resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
