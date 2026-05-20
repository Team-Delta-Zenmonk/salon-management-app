import { getTransactions } from "../list-inventory-logs/list-inventory-logs.service";
import type { InventoryLogsParams } from "../types/inventory-item.type";

export const getInventoryLogService = async (params: InventoryLogsParams = {}) => {
  return await getTransactions(params);
};
