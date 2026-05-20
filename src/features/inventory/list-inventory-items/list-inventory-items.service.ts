import { axiosInstance } from "../../../config/axios";
import type { InventoryItemsParams } from "../types/inventory-item.type";

export const listInventoryItemsService = async (params: InventoryItemsParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.category_uuid) queryParams.append("category_id", params.category_uuid);
  if (params.item_type) queryParams.append("item_type", params.item_type);

  if (params.sortBy) {
    if (params.sortBy === "newest") {
      queryParams.append("sort_by", "newest");
    } else if (params.sortBy === "name_asc") {
      queryParams.append("sort_by", "name");
      queryParams.append("sort_order", "ASC");
    } else if (params.sortBy === "name_desc") {
      queryParams.append("sort_by", "name");
      queryParams.append("sort_order", "DESC");
    } else if (params.sortBy === "stock_high_low") {
      queryParams.append("sort_by", "current_stock");
      queryParams.append("sort_order", "DESC");
    } else if (params.sortBy === "stock_low_high") {
      queryParams.append("sort_by", "current_stock");
      queryParams.append("sort_order", "ASC");
    }
  }

  const res = await axiosInstance.get(`/salons/inventory-items?${queryParams.toString()}`);
  return res.data;
};
