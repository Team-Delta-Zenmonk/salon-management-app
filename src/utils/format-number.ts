
export const formatIndianNumber = (value: number | string | null | undefined): string => {
  const num = Number(value);
  if (isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
};


export const formatCompactNumber = (value: number | string | null | undefined): string => {
  const num = Number(value);
  if (isNaN(num)) return "0";

  if (num >= 10000000) {
    const cr = num / 10000000;
    const formatted = cr % 1 === 0 ? cr.toString() : cr.toFixed(1).replace(/\.0$/, "");
    return `${formatted}Cr+`;
  }

  if (num >= 100000) {
    const lakh = num / 100000;
    const formatted = lakh % 1 === 0 ? lakh.toString() : lakh.toFixed(1).replace(/\.0$/, "");
    return `${formatted}L+`;
  }

  return num.toLocaleString("en-IN");
};

export const formatIndianCurrency = (
  value: number | string | null | undefined,
  compact = false
): string => {
  const num = Number(value);
  if (isNaN(num)) return "₹0";

  if (compact && num >= 100000) {
    return `₹${formatCompactNumber(num)}`;
  }

  return `₹${num.toLocaleString("en-IN")}`;
};

