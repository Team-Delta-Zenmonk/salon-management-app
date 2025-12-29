import { axiosInstance } from "../../../config/axios";

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const listCategoriesService = async (params: ListCategoriesParams = {}) => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);

  const res = await axiosInstance.get(`/salons/categories?${queryParams.toString()}`);
  return res?.data;
};
