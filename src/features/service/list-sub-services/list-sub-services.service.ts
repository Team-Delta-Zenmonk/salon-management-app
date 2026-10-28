import { axiosInstance } from "../../../config/axios";

export interface ListSubServicesParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export const listSubServicesService = async (serviceUuid: string, params?: ListSubServicesParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset !== undefined) queryParams.append("offset", params.offset.toString());

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const res = await axiosInstance.get(`/salons/services/${serviceUuid}/sub-services${query}`);
  return res.data;
};
