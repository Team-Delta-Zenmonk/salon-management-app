import { axiosInstance } from "../../../config/axios";

export interface VerifySalonPayload {
    otp: string;
    email: string;
  }
  
export const verifySalon = async (payload: VerifySalonPayload ) => {
  const response = await axiosInstance.post("/salon-onboardings/verify",payload);
  return response.data;
};
