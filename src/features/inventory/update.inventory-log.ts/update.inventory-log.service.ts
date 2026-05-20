import { axiosInstance } from "../../../config/axios";

export const updateInventoryLogService = async (uuid: string, data: any) => {
  const res = await axiosInstance.put(`/salons/inventory-transactions/${uuid}`, data);
  return res.data;
};
