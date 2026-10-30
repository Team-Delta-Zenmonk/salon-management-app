import { axiosInstance } from "../../config/axios";
import type { Salon } from "../auth/auth.slice";
import type { SubscriptionPlan } from "@/common/enums/subscription-plan.enum";
import type {
  SubscriptionInvoiceStatus,
  SubscriptionBillingCycle,
  SubscriptionPaymentMethod,
} from "@/common/enums/subscription-invoice.enum";

export interface SubscriptionInvoice {
  id: number;
  uuid: string;
  invoice_number: string;
  invoice_type?: "ALL" | "BOOKING" | "SUBSCRIPTION" | "THEME" | string;
  plan?: SubscriptionPlan | string;
  billing_cycle?: SubscriptionBillingCycle;
  amount: number | string;
  grand_total?: number | string;
  currency?: string;
  status: SubscriptionInvoiceStatus | string;
  payment_status?: string;
  payment_method?: SubscriptionPaymentMethod;
  payment_details?: {
    card_last4?: string;
    card_brand?: string;
    upi_id?: string;
    [key: string]: any;
  } | null;
  transaction_id?: string;
  stripe_payment_intent_id?: string | null;
  billing_period_start?: string;
  billing_period_end?: string;
  date?: string;
  created_at: string;
  invoice_url?: string;
}

export interface InvoicesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetInvoicesParams {
  type?: "ALL" | "BOOKING" | "SUBSCRIPTION" | "THEME";
  page?: number;
  limit?: number;
  order?: "ASC" | "DESC";
  sort?: "ASC" | "DESC";
}

export interface GetInvoicesResponse {
  invoices: SubscriptionInvoice[];
  pagination?: InvoicesPagination;
}

export interface SubscriptionIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  plan: SubscriptionPlan | string;
  plan_code?: string;
  plan_uuid?: string;
}

export interface UpgradeSubscriptionPayload {
  plan_uuid: string;
  billing_cycle?: SubscriptionBillingCycle | string;
  payment_method?: SubscriptionPaymentMethod | string;
  payment_details?: Record<string, any>;
  transaction_id?: string;
}

export interface UpgradeSubscriptionResponse {
  message: string;
  salon: Salon;
  invoice?: SubscriptionInvoice;
}

export const createSubscriptionIntent = async (
  plan_uuid: string
): Promise<SubscriptionIntentResponse> => {
  const res = await axiosInstance.post<SubscriptionIntentResponse>(
    "/salons/subscription/intent",
    { plan_uuid },
    { withCredentials: true }
  );
  return res.data;
};

export const upgradeSalonSubscription = async (
  payload: UpgradeSubscriptionPayload
): Promise<UpgradeSubscriptionResponse> => {
  const res = await axiosInstance.post<UpgradeSubscriptionResponse>(
    "/salons/subscription/upgrade",
    payload,
    { withCredentials: true }
  );
  return res.data;
};

export const getInvoices = async (
  params?: GetInvoicesParams
): Promise<GetInvoicesResponse> => {
  const res = await axiosInstance.get<GetInvoicesResponse>("/invoices", {
    params,
    withCredentials: true,
  });
  return res.data || { invoices: [] };
};

export const getSubscriptionInvoices = async (
  params?: GetInvoicesParams
): Promise<SubscriptionInvoice[]> => {
  const res = await getInvoices(params || { type: "SUBSCRIPTION" });
  return res.invoices || [];
};
