import { axiosInstance } from "../../../config/axios";

export const listServiceStaff = async (serviceUuid: string, salonId: string) => {
  const res = await axiosInstance.get(`/salons/services/${serviceUuid}/staffs`, {
    params: { salon_id: salonId },
  });
  return res.data;
};
