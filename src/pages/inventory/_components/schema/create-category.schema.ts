import * as z from "zod";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { FIELD_LIMITS } from "../../../../common/field-limits";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Required").max(FIELD_LIMITS.ITEM_NAME, `Max ${FIELD_LIMITS.ITEM_NAME} characters`)
    .regex(VALIDATE_PATTERN.alphaNumericSpecialWithSpace, "Only alphanumeric, spaces, hyphens, apostrophes, and dots allowed"),
});

export type CreateCategoryForm = z.infer<typeof createCategorySchema>;
