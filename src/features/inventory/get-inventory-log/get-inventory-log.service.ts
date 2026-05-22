import { axiosInstance } from "../../../config/axios";

export const getInventoryLogService = async (uuid: string) => {
  const res = await axiosInstance.get(`/salons/inventory-transactions/${uuid}`);
  return res.data;
};
