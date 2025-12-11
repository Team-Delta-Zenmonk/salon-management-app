import * as z from "zod";

export const CloudinaryFileSchema = z.object({
  url: z.string().min(1, "Required"),
  public_id: z.string().min(1, "Required"),
  format: z.string().min(1, "Required"),
  resource_type: z.string().min(1, "Required"),
  bytes: z.number().min(1, "Required"),
  type: z.string().min(1, "Required"),
  secure_url: z.string().min(1, "Required"),
  asset_folder: z.string().min(1, "Required"),
  filename: z.string().min(1, "Required"),
});

export type CloudinaryFile = z.infer<typeof CloudinaryFileSchema>;
