export const DISCOUNT_TYPE = {
  PERCENTAGE: "percentage",
  AMOUNT: "amount",
} as const;

export type DiscountType = (typeof DISCOUNT_TYPE)[keyof typeof DISCOUNT_TYPE];

export const DiscountTypeOptions: { label: string; value: DiscountType }[] = [
  { label: "Percentage", value: DISCOUNT_TYPE.PERCENTAGE },
  { label: "Amount", value: DISCOUNT_TYPE.AMOUNT },
];
