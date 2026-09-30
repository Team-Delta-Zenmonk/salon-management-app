import { axiosInstance } from "@/config/axios";
import type { BackendPlan } from "./plans.slice";

export const getSubscriptionPlansService = async (): Promise<BackendPlan[]> => {
  const res = await axiosInstance.get<{ plans: BackendPlan[] }>("/admin/plans");
  return res.data.plans;
};
