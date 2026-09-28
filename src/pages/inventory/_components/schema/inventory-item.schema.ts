import * as z from "zod";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { FIELD_LIMITS } from "../../../../common/field-limits";

export const inventoryItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Required")
    .max(FIELD_LIMITS.ITEM_NAME, `Max ${FIELD_LIMITS.ITEM_NAME} characters`)
    .regex(VALIDATE_PATTERN.alphaNumericSpecialWithSpace, "Only alphanumeric, spaces, hyphens, apostrophes, and dots allowed"),
  brand: z
    .string()
    .trim()
    .min(1, "Required")
    .max(FIELD_LIMITS.NAME, `Max ${FIELD_LIMITS.NAME} characters`)
    .regex(VALIDATE_PATTERN.alphaNumericSpecialWithSpace, "Only alphanumeric, spaces, hyphens, apostrophes, and dots allowed"),
  item_type: z.string().min(1, "Required"),
  category_id: z.string().min(1, "Required").optional().or(z.literal("")),
  logo: z.any().optional().nullable(),
  variant_name: z
    .string()
    .trim()
    .max(FIELD_LIMITS.CODE, `Max ${FIELD_LIMITS.CODE} characters`)
    .or(z.literal(""))
    .optional(),
  unit: z.string().optional().or(z.literal("")),
  unit_price: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(100000, "Maximum Value 100000")
    .default(0),
  min_stock_level: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(10000, "Maximum Value 10000")
    .optional()
    .default(0),
});

export type InventoryItemForm = z.infer<typeof inventoryItemSchema>;
