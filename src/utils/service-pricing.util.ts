import { PRICE_TYPE, type PriceType } from "../common/enums/price-type.enum";

export interface ParentServicePricingInfo {
  price_type?: PriceType | string | null;
  price?: number | null;
}

export interface SubServicePricingPayload {
  price_type?: PriceType | string;
  price?: number | string;
  discount?: number | string | null;
  discount_type?: string | null;
  [key: string]: any;
}

export function applySubServicePricingRules<T extends SubServicePricingPayload>(
  parent: ParentServicePricingInfo | null | undefined,
  targetPayload: T
): T {
  if (!parent || !targetPayload) return targetPayload;

  if (parent.price_type === PRICE_TYPE.FREE) {
    targetPayload.price_type = PRICE_TYPE.FREE;
    targetPayload.price = 0;
    targetPayload.discount = 0;
    targetPayload.discount_type = null;
  } else if (parent.price_type === PRICE_TYPE.FIXED) {
    targetPayload.price_type = PRICE_TYPE.FIXED;
    if (parent.price != null) {
      targetPayload.price = parent.price;
    }
  } else if (parent.price_type === PRICE_TYPE.FROM) {
    targetPayload.price_type = PRICE_TYPE.FROM;
    if (
      targetPayload.price !== undefined &&
      parent.price != null &&
      Number(targetPayload.price) < Number(parent.price)
    ) {
      throw new Error(`Sub-service price must be at least ₹${parent.price} (parent minimum price)`);
    }
  }

  return targetPayload;
}
