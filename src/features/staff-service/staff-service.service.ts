import { axiosInstance } from "../../config/axios";

interface StaffServicePayload {
  staff_services: Array<{
    service_uuid: string;
    staff_uuid: string;
    price_type?: string;
    price?: number;
    duration?: number;
  }>;
}

export const assignStaffToService = async (payload: StaffServicePayload) => {
  const response = await axiosInstance.post("/salons/staff-services", payload);
  return response.data;
};
