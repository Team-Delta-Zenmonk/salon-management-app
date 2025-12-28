import { axiosInstance } from "../../config/axios";

export const unassignStaffFromService = async (staffUuid: string, serviceUuid: string) => {
  const response = await axiosInstance.delete(`/salons/staff-services/${staffUuid}/${serviceUuid}`);
  return response.data;
};
