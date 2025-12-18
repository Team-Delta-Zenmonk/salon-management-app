import { axiosInstance } from "../../../config/axios";

export const listServiceStaff = async (serviceUuid: string) => {
  const res = await axiosInstance.get(`/salons/services/${serviceUuid}/staffs`);
  return res.data;
};
