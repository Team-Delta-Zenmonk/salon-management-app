import { axiosInstance } from "@/config/axios";
import type { BackendPlan } from "./plans.slice";

export interface ListPlansParams {
  page?: number;
  limit?: number;
  is_active?: boolean;
}

export interface ListPlansResponse {
  plans: BackendPlan[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export const getSubscriptionPlansService = async (
  params?: ListPlansParams
): Promise<ListPlansResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page !== undefined) queryParams.append("page", params.page.toString());
  if (params?.limit !== undefined) queryParams.append("limit", params.limit.toString());
  if (params?.is_active !== undefined) queryParams.append("is_active", params.is_active.toString());

  const url = queryParams.toString() ? `/admin/plans?${queryParams.toString()}` : "/admin/plans";
  const res = await axiosInstance.get<{ plans: BackendPlan[]; pagination: { total: number; page: number; limit: number } }>(url);
  return res.data;
};
