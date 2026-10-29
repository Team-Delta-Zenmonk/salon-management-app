import { axiosInstance } from "../../../config/axios";
import type { Booking } from "../booking.slice";

export const getBookingByUuidService = async (uuid: string): Promise<Booking> => {
  const response = await axiosInstance.get(`/bookings/${uuid}`);
  return response.data?.data;
};

