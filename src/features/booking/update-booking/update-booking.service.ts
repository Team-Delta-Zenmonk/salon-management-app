import { axiosInstance } from "../../../config/axios";

export interface UpdateBookingPayload {
  uuid: string;
  body: {
    status?: string;
    admin_booking?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    [key: string]: any;
  };
}

export const updateBookingService = async (payload: UpdateBookingPayload) => {
  const { uuid, body } = payload;
  const response = await axiosInstance.put(`/bookings/admin/${uuid}`, body);
  return response.data;
};
