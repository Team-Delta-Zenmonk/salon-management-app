import { axiosInstance } from "../../../config/axios";

interface ListServicesParams {
  category_uuid?: string;
}

export const listServicesService = async (params?: ListServicesParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.category_uuid) {
    queryParams.append('category_uuid', params.category_uuid);
  }
  
  const queryString = queryParams.toString();
  const url = `/salons/services${queryString ? `?${queryString}` : ''}`;
  
  const res = await axiosInstance.get(url);
  return res.data;
};