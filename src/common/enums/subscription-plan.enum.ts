export const SUBSCRIPTION_PLAN = {
  TRIAL: "trial",
  MONTHLY: "monthly",
  YEARLY: "yearly",
} as const;

export type SubscriptionPlan = (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN];

export const SubscriptionPlanOptions = [
  { label: "Free Trial", value: SUBSCRIPTION_PLAN.TRIAL },
  { label: "Monthly", value: SUBSCRIPTION_PLAN.MONTHLY },
  { label: "Yearly", value: SUBSCRIPTION_PLAN.YEARLY },
];
