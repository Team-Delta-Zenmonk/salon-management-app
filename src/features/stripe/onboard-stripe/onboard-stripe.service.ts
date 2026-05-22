import { axiosInstance } from "../../../config/axios";

export const onboardStripeService = async () => {
  const res = await axiosInstance.post("/salons/stripe/onboard");
  return res.data;
};
