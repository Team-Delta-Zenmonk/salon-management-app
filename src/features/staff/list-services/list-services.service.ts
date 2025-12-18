import { axiosInstance } from "../../../config/axios";

export const listStaffServices = async (staffUuid: string) => {
  const res = await axiosInstance.get(`/salons/staffs/${staffUuid}/services`);
  return res.data;
};
