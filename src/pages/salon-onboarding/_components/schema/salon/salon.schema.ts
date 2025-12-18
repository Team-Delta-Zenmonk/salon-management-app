import * as z from "zod";
import { CloudinaryFileSchema } from "../../../../../common/cloudinary.schema";

export const SalonSchema = z.object({
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
