import { axiosInstance } from "../../../config/axios";

export interface CreateBookingPayload {
  admin_booking: {
    name: string;
    phone: string;
    email?: string;
  };
  customer_id?: number | null;
  booking_start_time: string;
  booking_date: string;
  services: Array<{
    service_id: number;
    staff_id: number;
    sequence?: number;
  }>;
  status?: string;
}

export const createBookingService = async (payload: CreateBookingPayload) => {
  const response = await axiosInstance.post("/bookings/admin", payload);
  return response.data;
};
