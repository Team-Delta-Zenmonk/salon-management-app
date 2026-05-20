import { axiosInstance } from "../../../config/axios";

export const createInventoryLogService = async (data: any) => {
  const res = await axiosInstance.post("/salons/inventory-transactions", data);
  return res.data;
};
