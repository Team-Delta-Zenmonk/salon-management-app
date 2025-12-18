import { axiosInstance } from "../../../config/axios";

export const removeStaffService = async (uuid: string) => {
  const res = await axiosInstance.delete(`/salons/staffs/${uuid}`);
  return res.data;
};
