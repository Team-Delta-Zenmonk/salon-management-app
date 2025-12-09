import * as z from "zod";

export const SalonSchema = z.object({
  type: z.string({ message: "Required" }).min(1, "Required"),
  logo: z.string({ message: "Required" }).min(1, "Required"),
  salon_images: z
    .array(z.string())
    .min(1, "At least one salon photo is required")
    .nonempty("At least one salon photo is required"),
});

export type SalonForm = z.infer<typeof SalonSchema>;