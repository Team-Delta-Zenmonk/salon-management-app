export function getDiscountedPrice(item: any): {
  hasDiscount: boolean;
  originalPrice: number;
  finalPrice: number;
  discountBadge: string | null;
} {
  const service = item?.service || item;
  const basePrice = Number(
    item?.base_price ?? service?.price ?? item?.price ?? 0
  );
  const discount = Number(
    service?.discount ?? item?.discount ?? 0
  );
  const discountType = service?.discount_type ?? item?.discount_type;

  if (
    item?.final_price !== undefined &&
    item?.base_price !== undefined &&
    Number(item.final_price) < Number(item.base_price)
  ) {
    const diff = Number(item.base_price) - Number(item.final_price);
    let badge = `₹${diff} OFF`;
    if (discountType === "percentage" && discount > 0) {
      badge = `${discount}% OFF`;
    }
    return {
      hasDiscount: true,
      originalPrice: Number(item.base_price),
      finalPrice: Number(item.final_price),
      discountBadge: badge,
    };
  }

  if (discount > 0 && discountType) {
    let finalPrice = basePrice;
    let discountBadge = "";

    if (discountType === "percentage") {
      finalPrice = Math.max(0, Math.round(basePrice - (basePrice * discount) / 100));
      discountBadge = `${discount}% OFF`;
    } else if (discountType === "amount") {
      finalPrice = Math.max(0, basePrice - discount);
      discountBadge = `₹${discount} OFF`;
    }

    if (finalPrice < basePrice) {
      return {
        hasDiscount: true,
        originalPrice: basePrice,
        finalPrice,
        discountBadge,
      };
    }
  }

  return {
    hasDiscount: false,
    originalPrice: basePrice,
    finalPrice: Number(item?.final_price ?? basePrice),
    discountBadge: null,
  };
}
