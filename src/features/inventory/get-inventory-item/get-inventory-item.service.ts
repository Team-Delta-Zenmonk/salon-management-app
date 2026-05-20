import { axiosInstance } from "../../../config/axios";

export const getInventoryItemService = async (uuid: string) => {
  const res = await axiosInstance.get(`/salons/inventory-items/${uuid}`);
  return res.data;
};
