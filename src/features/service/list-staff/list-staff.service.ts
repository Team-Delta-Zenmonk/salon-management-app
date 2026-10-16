import { axiosInstance } from "../../../config/axios";

export interface ListServiceStaffParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export const listServiceStaff = async (
  serviceUuid: string,
  salonUuid: string,
  pagination?: ListServiceStaffParams,
) => {
  const res = await axiosInstance.get(`/salons/services/${serviceUuid}/staffs`, {
    params: {
      salon_uuid: salonUuid,
      ...(pagination?.page ? { page: pagination.page } : {}),
      ...(pagination?.limit ? { limit: pagination.limit } : {}),
      ...(pagination?.offset !== undefined ? { offset: pagination.offset } : {}),
    },
  });
  return res.data;
};
