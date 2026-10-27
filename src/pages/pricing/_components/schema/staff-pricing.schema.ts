import * as z from "zod";
import { PRICE_TYPE } from "../../../../common/enums/price-type.enum";

export const staffPricingSchema = z
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
  })
  .superRefine((data, ctx) => {
    const numPrice = Number(data.price);
    if (data.price_type === PRICE_TYPE.FIXED) {
      if (!isNaN(numPrice) && numPrice <= 0) {
        ctx.addIssue({
          code: "custom",
          path: ["price"],
          message: "Price must be greater than 0",
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

export type StaffPricingFormValues = z.infer<typeof staffPricingSchema>;
