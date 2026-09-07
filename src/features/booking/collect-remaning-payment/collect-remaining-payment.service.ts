import { axiosInstance } from "../../../config/axios";

export interface CollectRemainingPaymentPayload {
  uuid: string;
}

export const collectRemainingPaymentService = async (payload: CollectRemainingPaymentPayload) => {
  const { uuid } = payload;
  const response = await axiosInstance.patch(`/bookings/${uuid}/collect-payment`);
  return response.data;
};
