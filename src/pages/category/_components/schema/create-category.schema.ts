import * as z from "zod";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";
import { CloudinaryFileSchema } from "../../../../common/cloudinary.schema";

export const categorySchema = z.object({
  name: z.string({ message: "Required" }).min(2, { message: "Required" }).max(50, { message: "Max 50 characters" }).regex(VALIDATE_PATTERN.alphabetWithSpecial, { message: "Only alphabets and special characters are allowed" }),
  description: z.string({ message: "Required" }).min(10, { message: "Required" }).max(300, { message: "Max 100 characters" }).regex(VALIDATE_PATTERN.alphaNumericSpecialWithSpace, { message: "Only alphabets, numbers and special characters are allowed" }),
  logo: CloudinaryFileSchema.optional(),
});

export type categoryForm = z.infer<typeof categorySchema>;
