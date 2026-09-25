import * as z from "zod";
import { CloudinaryFileSchema } from "../../../../common/cloudinary.schema";
import { SERVICE_GENDER } from "../../../../common/enums/service-gender.enum";
import { PRICE_TYPE } from "../../../../common/enums/price-type.enum";
import { DISCOUNT_TYPE } from "../../../../common/enums/discount-type.enum";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";

export const serviceSchema = z
  .object({
    name: z
      .string({ message: "Required" })
      .min(2, { message: "Minimum 2 characters" })
      .max(250, { message: "Maximum 250 characters" })
      .regex(VALIDATE_PATTERN.alphabetWithSpecial, {
        message: "Only alphabets and special characters are allowed",
      }),
    description: z
      .string({ message: "Required" })
      .min(2, { message: "Minimum 2 characters" })
      .max(300, { message: "Maximum 300 characters" })
      .regex(VALIDATE_PATTERN.alphabetWithSpecial, {
        message: "Only alphabets and special characters are allowed",
      }),
    logo: CloudinaryFileSchema.nullable().optional(),
    category_id: z.string().optional().nullable(),
    duration: z
      .string({ message: "Required" })
      .min(1, { message: "Required" })
      .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Duration must be greater than 0",
      })
      .refine((val) => !isNaN(Number(val)) && Number(val) <= 600, {
        message: "Duration cannot exceed 10 hours (600 minutes)",
      }),
    gender: z.enum(Object.values(SERVICE_GENDER), { message: "Required" }),
    price_type: z.enum(Object.values(PRICE_TYPE), { message: "Required" }),
    price: z
      .string({ message: "Required" })
      .min(1, { message: "Required" })
      .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Price cannot be negative",
      })
      .refine((val) => !isNaN(Number(val)) && Number(val) <= 100000, {
        message: "Price cannot exceed ₹1,00,000",
      }),
    discount: z.string().optional().nullable(),
    discount_type: z
      .enum(Object.values(DISCOUNT_TYPE), { message: "Required" })
      .optional()
      .nullable(),
    is_active: z.boolean().optional(),
    is_popular: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const numPrice = Number(data.price);
    const numDiscount = data.discount ? Number(data.discount) : 0;

    if (data.discount && numDiscount > 0) {
      if (!data.discount_type) {
        ctx.addIssue({
          code: "custom",
          path: ["discount_type"],
          message: "Please select a discount type",
        });
        return;
      }

      if (data.discount_type === DISCOUNT_TYPE.PERCENTAGE) {
        if (numDiscount > 100) {
          ctx.addIssue({
            code: "custom",
            path: ["discount"],
            message: "Discount percentage cannot be greater than 100%",
          });
        }
      } else if (data.discount_type === DISCOUNT_TYPE.AMOUNT) {
        if (!isNaN(numPrice) && numPrice > 0 && numDiscount > numPrice) {
          ctx.addIssue({
            code: "custom",
            path: ["discount"],
            message: "Discount amount cannot be greater than the price (100%)",
          });
        }
      }
    }
  });

export type ServiceForm = z.infer<typeof serviceSchema>;
