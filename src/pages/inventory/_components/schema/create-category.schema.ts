import * as z from "zod";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Required").max(50, "Max 50 characters")
    .regex(VALIDATE_PATTERN.alphaNumericSpecialWithSpace, "Only alphanumeric, spaces, hyphens, apostrophes, and dots allowed"),
});

export type CreateCategoryForm = z.infer<typeof createCategorySchema>;
