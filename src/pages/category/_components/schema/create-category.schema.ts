import * as z from "zod";
import { CloudinaryFileSchema } from "../../../../common/cloudinary.schema";

export const categorySchema = z.object({
  name: z.string({ message: "Required" }).min(2, { message: "Required" }),
  description: z.string({ message: "Required" }).min(10, { message: "Required" }),
  logo: CloudinaryFileSchema.optional(),
});

export type categoryForm = z.infer<typeof categorySchema>;
