import { axiosInstance } from "../../../config/axios";

export interface ListStaffServicesParams {
  page?: number;
  limit?: number;
}

export const listStaffServices = async (staffUuid: string, params?: ListStaffServicesParams) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const res = await axiosInstance.get(`/salons/staffs/${staffUuid}/services${query}`);
  return res.data;
};
