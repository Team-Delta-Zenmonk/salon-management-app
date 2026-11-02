import { axiosInstance } from "../../config/axios";

export interface StaffServiceItem {
  service_uuid: string;
  staff_uuid: string;
  price_type?: string;
  price?: number;
  duration?: number;
}

export interface StaffServicePayload {
  staff_services: StaffServiceItem[];
}

export const assignStaffToService = async (payload: StaffServicePayload) => {
  const sanitizedPayload: StaffServicePayload = {
    staff_services: (payload.staff_services || []).map((item) => {
      const isFree = item.price_type?.toLowerCase() === "free";
      const resolvedPrice = isFree
        ? 0
        : item.price != null && !isNaN(Number(item.price))
        ? Number(item.price)
        : 0;

      return {
        ...item,
        price: resolvedPrice,
      };
    }),
  };

  const response = await axiosInstance.post("/salons/staff-services", sanitizedPayload);
  return response.data;
};
