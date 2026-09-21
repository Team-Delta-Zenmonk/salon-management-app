export const SUBSCRIPTION_PLAN = {
  TRIAL: "trial",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN];
