import { axiosInstance } from "../../../config/axios";

export const createInventoryItemService = async (data: any) => {
  const res = await axiosInstance.post("/salons/inventory-items", data);
  return res.data;
};
