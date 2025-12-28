import { axiosInstance } from "../../../config/axios";
interface ListServicesParams {
  category_uuid?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const listServicesService = async (params?: ListServicesParams) => {
  const queryParams = new URLSearchParams();

  if (params?.category_uuid) {
    queryParams.append("category_uuid", params.category_uuid);
  }
  if (params?.page) {
    queryParams.append("page", params.page.toString());
  }
  if (params?.limit) {
    queryParams.append("limit", params.limit.toString());
  }
  if (params?.search) {
    queryParams.append("search", params.search);
  }

  const queryString = queryParams.toString();
  const url = `/salons/services${queryString ? `?${queryString}` : ""}`;

  const res = await axiosInstance.get(url);
  return res.data;
};