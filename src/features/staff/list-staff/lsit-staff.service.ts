import { axiosInstance } from "../../../config/axios";

export interface ListStaffParams {
  page?: number;
  limit?: number;
}

export const listStaffService = async (params?: ListStaffParams) => {
  const query = new URLSearchParams();

  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));

  const url = `/salons/staffs${query.toString() ? `?${query.toString()}` : ""}`;
  const res = await axiosInstance.get(url);

  return res.data;
};
