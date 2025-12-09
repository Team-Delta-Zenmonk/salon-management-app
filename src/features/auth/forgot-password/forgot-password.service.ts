import { axiosInstance } from "../../../config/axios";

export const forgotPassword = async (email: string) => {
  const res = await axiosInstance.post("/auth/forgot-password/salon", { email });
  return res.data as string;
};
