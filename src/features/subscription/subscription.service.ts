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
  plan: SubscriptionPlan;
  billing_cycle: SubscriptionBillingCycle;
  amount: number | string;
  currency: string;
  status: SubscriptionInvoiceStatus;
  payment_method: SubscriptionPaymentMethod;
  payment_details?: {
    card_last4?: string;
    card_brand?: string;
    upi_id?: string;
    [key: string]: any;
  } | null;
  transaction_id: string;
  stripe_payment_intent_id?: string | null;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
}

export interface SubscriptionIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  plan: SubscriptionPlan;
}

export interface UpgradeSubscriptionPayload {
  plan: SubscriptionPlan;
  billing_cycle?: SubscriptionBillingCycle;
  payment_method?: SubscriptionPaymentMethod;
  payment_details?: Record<string, any>;
  transaction_id?: string;
}

export interface UpgradeSubscriptionResponse {
  message: string;
  salon: Salon;
  invoice?: SubscriptionInvoice;
}

export const createSubscriptionIntent = async (
  plan: SubscriptionPlan
): Promise<SubscriptionIntentResponse> => {
  const res = await axiosInstance.post<SubscriptionIntentResponse>(
    "/salons/subscription/intent",
    { plan },
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

export const getSubscriptionInvoices = async (): Promise<SubscriptionInvoice[]> => {
  const res = await axiosInstance.get<{ invoices: SubscriptionInvoice[] }>(
    "/salons/subscription/invoices",
    { withCredentials: true }
  );
  return res.data?.invoices || [];
};
