import * as z from "zod";

export const CloudinaryFileSchema = z.object({
  url: z.string().min(1, "Required"),
  public_id: z.string().min(1, "Required"),
  format: z.string().optional().nullable(),
  resource_type: z.string().min(1, "Required"),
  bytes: z.number().optional().nullable(),
  type: z.string().optional().nullable(),
  secure_url: z.string().min(1, "Required"),
  asset_folder: z.string().optional().nullable(),
  filename: z.string().optional().nullable(),
});

export type CloudinaryFile = z.infer<typeof CloudinaryFileSchema>;
