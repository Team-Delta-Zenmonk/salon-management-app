import * as z from "zod";
import { CloudinaryFileSchema } from "../../../../common/cloudinary.schema";
import { SERVICE_GENDER } from "../../../../common/enums/service-gender.enum";
import { PRICE_TYPE } from "../../../../common/enums/price-type.enum";
import { DISCOUNT_TYPE } from "../../../../common/enums/discount-type.enum";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";

export const serviceSchema = z.object({
  name: z.string({ message: "Required" }).min(2, { message: "Minimum 2 characters" }).max(50, { message: "Maximum 30 characters" }).regex(VALIDATE_PATTERN.alphabetWithSpecial, { message: "Only alphabets and special characters are allowed" }),
  description: z.string({ message: "Required" }).min(2, { message: "Minimum 2 characters" }).max(100, { message: "Maximum 100 characters" }).regex(VALIDATE_PATTERN.alphabetWithSpecial, { message: "Only alphabets and special characters are allowed" }),
  logo: CloudinaryFileSchema.nullable().optional(),
  category_id: z.string().optional().nullable(),
  duration: z.string({ message: "Required" }).min(1, { message: "Required" }),
  gender: z.enum(Object.values(SERVICE_GENDER), { message: "Required" }),
  price_type: z.enum(Object.values(PRICE_TYPE), { message: "Required" }),
  price: z.string({ message: "Required" }).min(1, { message: "Required" }),
  discount: z.string().min(0).optional().nullable(),
  discount_type: z.enum(Object.values(DISCOUNT_TYPE), { message: "Required" }).optional().nullable(),
  is_active: z.boolean().optional(),
  is_popular: z.boolean().optional(),
});

export type ServiceForm = z.infer<typeof serviceSchema>;
