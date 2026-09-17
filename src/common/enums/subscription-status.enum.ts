export const SUBSCRIPTION_STATUS = {
  TRIAL: "trial",
  ACTIVE: "active",
  EXPIRED: "expired",
  SUSPENDED: "suspended",
  PENDING_PAYMENT: "pending_payment",
} as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];
