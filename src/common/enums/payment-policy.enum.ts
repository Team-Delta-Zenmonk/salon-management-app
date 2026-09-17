export const PAYMENT_POLICY = {
  PAY_AT_VENUE: "pay_at_venue",
  PARTIAL_DEPOSIT: "partial_deposit",
  FULL_UPFRONT: "full_upfront",
} as const;

export type PaymentPolicy = (typeof PAYMENT_POLICY)[keyof typeof PAYMENT_POLICY];

export const PaymentPolicyOptions = [
  { label: "Pay at venue", value: PAYMENT_POLICY.PAY_AT_VENUE },
  { label: "Partial deposit", value: PAYMENT_POLICY.PARTIAL_DEPOSIT },
  { label: "Full upfront", value: PAYMENT_POLICY.FULL_UPFRONT },
];
