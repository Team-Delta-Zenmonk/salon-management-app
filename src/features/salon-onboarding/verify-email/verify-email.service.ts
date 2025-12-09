import { axiosInstance } from "../../../config/axios";

export interface VerifyEmailPayload {
    otp: string;
    email: string;
  }
  
export const verifyEmail = async (payload: VerifyEmailPayload ) => {
  const response = await axiosInstance.post("/salon-onboardings/verify",payload);
  return response.data;
};
