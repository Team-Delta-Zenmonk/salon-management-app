import { axiosInstance } from "../../../config/axios";

export const resetPassword = async (token: string, password: string) => {
  const res = await axiosInstance.post("/auth/reset-password/salon", { token, password });
  return res.data as string;
};
