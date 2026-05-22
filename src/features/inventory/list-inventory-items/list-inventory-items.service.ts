import { axiosInstance } from "../../../config/axios";
import type { InventoryItemsParams } from "../types/inventory-item.type";

export const listInventoryItemsService = async (params: InventoryItemsParams = {}) => {
  const res = await axiosInstance.get(`/salons/inventory-items`, { params });
  return res.data;
};
