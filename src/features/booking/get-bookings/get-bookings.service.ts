import { axiosInstance } from "../../../config/axios";
import { type BookingFilter } from "../../../common/enums/booking-filter.enum";

export interface GetBookingsParams {
  filter?: BookingFilter;
  page?: number;
  limit?: number;
}

export const getBookingsService = async (params: GetBookingsParams) => {
  const queryParams = new URLSearchParams();
  if (params.filter) queryParams.append("filter", params.filter);
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());

  const response = await axiosInstance.get(`/bookings?${queryParams.toString()}`);
  return response.data.data;
};
