import { axiosInstance } from "../../../config/axios";
import type { StaffForm } from "../../../pages/staff/_components/schema/staff.schema";

export const updateStaffService = async (uuid: string, body: Partial<StaffForm>) => {
  const res = await axiosInstance.put(`/salons/staffs/${uuid}`, body);
  return res.data;
};
