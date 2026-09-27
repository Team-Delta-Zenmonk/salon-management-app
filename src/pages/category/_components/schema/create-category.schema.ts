import * as z from "zod";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { CloudinaryFileSchema } from "../../../../common/cloudinary.schema";
import { FIELD_LIMITS } from "../../../../common/field-limits";

export const categorySchema = z.object({
  name: z.string({ message: "Required" }).min(2, { message: "Required" }).max(FIELD_LIMITS.ITEM_NAME, { message: `Max ${FIELD_LIMITS.ITEM_NAME} characters` }).regex(VALIDATE_PATTERN.alphabetWithSpecial, { message: "Only alphabets and special characters are allowed" }),
  description: z.string({ message: "Required" }).min(10, { message: "Required" }).max(FIELD_LIMITS.DESCRIPTION, { message: `Max ${FIELD_LIMITS.DESCRIPTION} characters` }).regex(VALIDATE_PATTERN.alphaNumericSpecialWithSpace, { message: "Only alphabets, numbers and special characters are allowed" }),
  logo: CloudinaryFileSchema.optional(),
});

export type categoryForm = z.infer<typeof categorySchema>;
