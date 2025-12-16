import { axiosInstance } from "../../../config/axios";
import type { ServiceForm } from "../../../pages/services/_components/schema/service.schema";

export const updateServiceService = async (uuid: string, body: Partial<ServiceForm>) => {
  const res = await axiosInstance.put(`/salons/services/${uuid}`, body);
  return res.data;
};
