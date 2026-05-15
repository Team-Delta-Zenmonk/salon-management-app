import { axiosInstance } from "../../../config/axios";

export interface DeleteBookingPayload {
  uuid: string;
}

export const deleteBookingService = async (payload: DeleteBookingPayload) => {
  const response = await axiosInstance.delete(`/bookings/admin/${payload.uuid}`);
  return response.data;
};
