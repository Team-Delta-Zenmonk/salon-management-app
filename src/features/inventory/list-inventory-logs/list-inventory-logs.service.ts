import { axiosInstance } from "../../../config/axios";
import type { InventoryLogsParams } from "../types/inventory-item.type";

export const listInventoryLogsService = async (params: InventoryLogsParams = {}) => {
  const res = await axiosInstance.get(`/salons/inventory-transactions`, { params });
  return res.data;
};
