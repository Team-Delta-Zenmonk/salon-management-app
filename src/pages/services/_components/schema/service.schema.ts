import * as z from "zod";
import { CloudinaryFileSchema } from "../../../../common/cloudinary.schema";
import { SERVICE_GENDER } from "../../../../common/enums/service-gender.enum";
import { PRICE_TYPE } from "../../../../common/enums/price-type.enum";
import { DISCOUNT_TYPE } from "../../../../common/enums/discount-type.enum";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { FIELD_LIMITS } from "../../../../common/field-limits";
import { getCurrencyConfig } from "../../../../common/currencies.config";

export const getServiceSchema = (
  isSubService: boolean = false,
  currencyCode?: string,
  parentService?: { price_type?: string; price?: number } | null
) => {
  const currencyConfig = getCurrencyConfig(currencyCode);
  return z
    .object({
      name: z
        .string({ message: "Required" })
        .min(1, { message: "Required" })
        .max(FIELD_LIMITS.ITEM_NAME, { message: `Maximum ${FIELD_LIMITS.ITEM_NAME} characters` })
        .regex(VALIDATE_PATTERN.alphabetWithSpecial, {
          message: "Only alphabets and special characters are allowed",
        }),
      description: z
        .string({ message: "Required" })
        .min(1, { message: "Required" })
        .max(FIELD_LIMITS.DESCRIPTION, { message: `Maximum ${FIELD_LIMITS.DESCRIPTION} characters` })
        .regex(VALIDATE_PATTERN.alphabetWithSpecial, {
          message: "Only alphabets and special characters are allowed",
        }),
      logo: CloudinaryFileSchema.nullable().optional(),
      category_id: isSubService
        ? z.string().optional().nullable()
        : z
            .string({ message: "Required" })
            .min(1, { message: "Required" }),
      duration: z
        .string({ message: "Required" })
        .min(1, { message: "Required" })
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
          message: "Duration must be greater than 0",
        })
        .refine((val) => !isNaN(Number(val)) && Number(val) <= 1440, {
          message: "Duration cannot exceed 24 hours (1440 minutes)",
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
      discount: z.union([z.string(), z.number()]).optional().nullable(),
      discount_type: z
        .enum(Object.values(DISCOUNT_TYPE))
        .or(z.literal(""))
        .optional()
        .nullable(),
      is_active: z.boolean().optional(),
      is_popular: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      const numPrice = Number(data.price);

      if (
        isSubService &&
        parentService &&
        parentService.price_type === PRICE_TYPE.FROM &&
        parentService.price != null
      ) {
        if (!isNaN(numPrice) && numPrice < parentService.price) {
          ctx.addIssue({
            code: "custom",
            path: ["price"],
            message: `Price must be at least ${currencyConfig.symbol}${parentService.price}`,
          });
        }
      }

      if (data.price_type === PRICE_TYPE.FIXED || data.price_type === PRICE_TYPE.FROM) {
        if (!isNaN(numPrice) && numPrice < currencyConfig.minServicePrice) {
          ctx.addIssue({
            code: "custom",
            path: ["price"],
            message: `Price must be at least ${currencyConfig.symbol}${currencyConfig.minServicePrice} for paid services`,
          });
        }
      } else if (data.price_type === PRICE_TYPE.FREE) {
        if (!isNaN(numPrice) && numPrice !== 0) {
          ctx.addIssue({
            code: "custom",
            path: ["price"],
            message: "Price must be 0 for free service",
          });
        }
        return;
      }

      const hasDiscountType = Boolean(data.discount_type);
      const discountStr =
        data.discount !== undefined && data.discount !== null
          ? String(data.discount).trim()
          : "";
      const hasDiscountValue = discountStr !== "";
      const numDiscount = hasDiscountValue ? Number(discountStr) : 0;

      if (hasDiscountType) {
        if (!hasDiscountValue) {
          ctx.addIssue({
            code: "custom",
            path: ["discount"],
            message: "Required",
          });
          return;
        }
        if (isNaN(numDiscount) || numDiscount <= 0) {
          ctx.addIssue({
            code: "custom",
            path: ["discount"],
            message: "Discount must be greater than 0",
          });
          return;
        }
      }

      if (hasDiscountValue && numDiscount > 0) {
        if (!hasDiscountType) {
          ctx.addIssue({
            code: "custom",
            path: ["discount_type"],
            message: "Please select a discount type",
          });
          return;
        }
      }

      if (hasDiscountType && hasDiscountValue && numDiscount > 0) {
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
              message: "Discount amount cannot exceed the service price.",
            });
          }
        }
      }
    });
};

export const serviceSchema = getServiceSchema(false);

export type ServiceForm = z.infer<typeof serviceSchema>;
