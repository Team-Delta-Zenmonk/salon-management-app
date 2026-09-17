export const SUBSCRIPTION_INVOICE_STATUS = {
  PAID: "paid",
  PENDING: "pending",
  FAILED: "failed",
} as const;

export type SubscriptionInvoiceStatus =
  (typeof SUBSCRIPTION_INVOICE_STATUS)[keyof typeof SUBSCRIPTION_INVOICE_STATUS];

export const SUBSCRIPTION_BILLING_CYCLE = {
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type SubscriptionBillingCycle =
  (typeof SUBSCRIPTION_BILLING_CYCLE)[keyof typeof SUBSCRIPTION_BILLING_CYCLE];

export const SUBSCRIPTION_PAYMENT_METHOD = {
  CARD: "card",
  UPI: "upi",
  STRIPE: "stripe",
  NETBANKING: "netbanking",
  MANUAL: "manual",
} as const;

export type SubscriptionPaymentMethod =
  (typeof SUBSCRIPTION_PAYMENT_METHOD)[keyof typeof SUBSCRIPTION_PAYMENT_METHOD];
