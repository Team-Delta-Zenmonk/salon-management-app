import { axiosInstance } from "../../../config/axios";
import type { InventoryLogsParams } from "../types/inventory-item.type";

export const getTransactions = async (params: InventoryLogsParams = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);
    if (params.item_uuid) queryParams.append("item_uuid", params.item_uuid);

    if (params.sortBy) {
        if (params.sortBy === "received_date_desc") {
            queryParams.append("sort_by", "received_date");
            queryParams.append("sort_order", "DESC");
        } else if (params.sortBy === "received_date_asc") {
            queryParams.append("sort_by", "received_date");
            queryParams.append("sort_order", "ASC");
        } else if (params.sortBy === "ordered_date_desc") {
            queryParams.append("sort_by", "ordered_date");
            queryParams.append("sort_order", "DESC");
        } else if (params.sortBy === "ordered_date_asc") {
            queryParams.append("sort_by", "ordered_date");
            queryParams.append("sort_order", "ASC");
        } else if (params.sortBy === "amount_high_low") {
            queryParams.append("sort_by", "bill_amount");
            queryParams.append("sort_order", "DESC");
        } else if (params.sortBy === "amount_low_high") {
            queryParams.append("sort_by", "bill_amount");
            queryParams.append("sort_order", "ASC");
        }
    }

    const res = await axiosInstance.get(`/salons/inventory-transactions?${queryParams.toString()}`);
    return res.data;
};
