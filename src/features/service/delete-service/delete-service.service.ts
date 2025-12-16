import { axiosInstance } from "../../../config/axios";

export const deleteServiceService = async (uuid: string) => {
  const res = await axiosInstance.delete(`/salons/services/${uuid}`);
  return res.data;
};
