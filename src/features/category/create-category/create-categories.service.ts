import { axiosInstance } from "../../../config/axios";

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  logo?: string;
}

export const createCategoryService = async (payload: CreateCategoryPayload) => {
  const res = await axiosInstance.post("/salons/categories", payload);
  return res.data;
};
