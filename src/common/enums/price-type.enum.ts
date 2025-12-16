export const PRICE_TYPE = {
  FROM: "from",
  FIXED: "fixed",
  FREE: "free",
} as const;

export type PriceType = typeof PRICE_TYPE[keyof typeof PRICE_TYPE];

export const PriceTypeOptions: { label: string; value: PriceType }[] = [
  { label: "From", value: PRICE_TYPE.FROM },
  { label: "Fixed", value: PRICE_TYPE.FIXED },
  { label: "Free", value: PRICE_TYPE.FREE },
];
