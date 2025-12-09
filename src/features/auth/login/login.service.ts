import { axiosInstance } from "../../../config/axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginSalon = async (payload: LoginPayload) => {
  const res = await axiosInstance.post("/auth/login/salon", payload);
  return res.data;
};
