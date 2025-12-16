import { axiosInstance } from "../../../config/axios";

export const listSubServicesService = async (serviceUuid: string) => {
  const res = await axiosInstance.get(`/salons/services/${serviceUuid}/sub-services`);
  return res.data;
};
