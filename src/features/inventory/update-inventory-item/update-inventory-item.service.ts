import { axiosInstance } from "../../../config/axios";

export const updateInventoryItemService = async (uuid: string, data: any) => {
  const res = await axiosInstance.put(`/salons/inventory-items/${uuid}`, data);
  return res.data;
};
