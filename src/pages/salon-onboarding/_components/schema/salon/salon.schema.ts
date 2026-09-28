import * as z from "zod";
import { CloudinaryFileSchema } from "../../../../../common/cloudinary.schema";
import { FIELD_LIMITS } from "../../../../../common/field-limits";

export const SalonSchema = z.object({
  slug: z
    .string()
    .min(3, "Subdomain must be at least 3 characters")
    .max(FIELD_LIMITS.SLUG, `Subdomain cannot exceed ${FIELD_LIMITS.SLUG} characters`)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and single hyphens"
    ),
  type: z.string().min(1, "Required"),
  logo: CloudinaryFileSchema.nullable().refine((val) => val !== null, {
    message: "Salon logo is required",
  }),
  photos: z
    .array(CloudinaryFileSchema)
    .min(1, "At least one salon photo is required")
    .nonempty("At least one salon photo is required"),
});

export type SalonForm = z.infer<typeof SalonSchema>;
