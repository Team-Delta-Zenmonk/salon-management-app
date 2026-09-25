import * as z from "zod";
import { PRICE_TYPE } from "../../../../common/enums/price-type.enum";

export const staffPricingSchema = z.object({
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
      message: "Price cannot exceed ₹1,00,000",
    }),
  duration: z
    .string({ message: "Required" })
    .min(1, { message: "Required" })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Duration must be greater than 0",
    })
    .refine((val) => !isNaN(Number(val)) && Number(val) <= 600, {
      message: "Duration cannot exceed 10 hours (600 minutes)",
    }),
});

export type StaffPricingFormValues = z.infer<typeof staffPricingSchema>;
