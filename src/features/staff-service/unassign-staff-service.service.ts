import { axiosInstance } from "../../config/axios";
interface BulkUnassignPayload {
  staff_services: string[];
  cascade?: boolean;
}

export const unassignStaffFromService = async (payload: BulkUnassignPayload) => {
  const response = await axiosInstance.post("/salons/staff-services/unassign", payload);
  return response.data;
};
