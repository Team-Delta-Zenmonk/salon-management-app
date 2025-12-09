import { axiosInstance } from "../../../config/axios";

export const resendOTP = async (email: string ) => {
  const response = await axiosInstance.post("/salon-onboardings/resend-otp",{email});
  return response.data;
};
