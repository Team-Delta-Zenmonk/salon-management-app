import { axiosInstance } from "../../../config/axios";
import type { CreateItemCategoryPayload } from "../types/category.type";

export const createItemCategoryService = async (data: CreateItemCategoryPayload) => {
  const res = await axiosInstance.post("/salons/items-category", data);
  return res.data;
};
