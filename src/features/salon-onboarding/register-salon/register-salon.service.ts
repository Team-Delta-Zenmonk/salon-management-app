import { axiosInstance } from "../../../config/axios";

export interface RegisterSalonPayload {
  email: string;
  name: string;
  password: string;
}

export const registerSalon = async (payload: RegisterSalonPayload) => {
  const response = await axiosInstance.post("/salon-onboardings/init", payload);
  return response.data;
};
