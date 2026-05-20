import { axiosInstance } from "../../../config/axios";
import type { ItemCategoriesParams } from "../types/category.type";

export const getItemCategories = async (params: ItemCategoriesParams = {}) => {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.search) queryParams.append("search", params.search);

    const res = await axiosInstance.get(`/salons/items-category?${queryParams.toString()}`);
    return res.data;
};
