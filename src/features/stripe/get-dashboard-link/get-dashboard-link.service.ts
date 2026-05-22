import { axiosInstance } from "../../../config/axios";

export const getStripeDashboardLinkService = async () => {
  const res = await axiosInstance.get("/salons/stripe/dashboard");
  return res.data;
};
