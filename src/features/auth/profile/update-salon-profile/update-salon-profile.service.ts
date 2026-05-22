import { axiosInstance } from "../../../../config/axios";

export const updateSalonProfile = async (payload: any) => {
  const res = await axiosInstance.put("/salons", payload);
  return res.data;
};
