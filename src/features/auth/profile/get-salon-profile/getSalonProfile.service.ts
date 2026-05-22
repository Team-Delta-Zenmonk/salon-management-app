import { axiosInstance } from "../../../../config/axios";

export const getSalonProfile = async (uuid: string) => {
  const res = await axiosInstance.get(`/salons/${uuid}`);
  return res.data;
};
