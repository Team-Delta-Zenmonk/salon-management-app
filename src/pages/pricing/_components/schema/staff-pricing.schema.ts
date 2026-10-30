import * as z from "zod";
import { PRICE_TYPE } from "../../../../common/enums/price-type.enum";
import { getCurrencyConfig } from "../../../../common/currencies.config";

export const getStaffPricingSchema = (currencyCode?: string) => {
  const currencyConfig = getCurrencyConfig(currencyCode);
  return z
    .object({
      price_type: z.enum(Object.values(PRICE_TYPE) as [string, ...string[]], {
        message: "Required",
      }),
      price: z
        .string({ message: "Required" })
        .min(1, { message: "Required" })
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
          message: "Price cannot be negative",
        })
        .refine((val) => !isNaN(Number(val)) && Number(val) <= 100000, {
          message: `Price cannot exceed ${currencyConfig.symbol}1,00,000`,
        }),
      duration: z
        .string({ message: "Required" })
        .min(1, { message: "Required" })
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: "Duration must be greater than 0",
        })
        .refine((val) => !isNaN(Number(val)) && Number(val) <= 1440, {
          message: "Duration cannot exceed 24 hours (1440 minutes)",
        }),
    })
    .superRefine((data, ctx) => {
      const numPrice = Number(data.price);
      if (data.price_type === PRICE_TYPE.FIXED || data.price_type === PRICE_TYPE.FROM) {
        if (!isNaN(numPrice) && numPrice < currencyConfig.minServicePrice) {
          ctx.addIssue({
            code: "custom",
            path: ["price"],
            message: `Staff price must be at least ${currencyConfig.symbol}${currencyConfig.minServicePrice} for paid services`,
          });
        }
      } else if (data.price_type === PRICE_TYPE.FREE && !isNaN(numPrice) && numPrice !== 0) {
        ctx.addIssue({
          code: "custom",
          path: ["price"],
          message: "Price must be 0 for free service",
        });
      }
    });
};

export const staffPricingSchema = getStaffPricingSchema();

export type StaffPricingFormValues = z.infer<typeof staffPricingSchema>;
