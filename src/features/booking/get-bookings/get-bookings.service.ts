import { axiosInstance } from "../../../config/axios";
import { type BookingFilter } from "../../../common/enums/booking-filter.enum";

export interface GetBookingsParams {
  filter?: BookingFilter;
  page?: number;
  limit?: number;
  view?: "calendar" | "table";
  payment_policy?: string;
  staff_uuid?: string;
  service_uuid?: string;
  start_date?: string;
  end_date?: string;
}

export const getBookingsService = async (params: GetBookingsParams) => {
  const response = await axiosInstance.get("/bookings", { params });
  return response.data;
};

