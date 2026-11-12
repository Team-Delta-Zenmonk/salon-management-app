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

export const CloudinaryImageSchema = CloudinaryFileSchema.extend({
  resource_type: z.literal("image", {
    message: "Only images are allowed",
  }),
  format: z
    .string()
    .optional()
    .nullable()
    .refine(
      (fmt) =>
        !fmt ||
        ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(
          fmt.toLowerCase()
        ),
      {
        message: "Invalid image format. Allowed formats: jpg, jpeg, png, webp",
      }
    ),
});

export const CloudinaryDocSchema = CloudinaryFileSchema.extend({
  resource_type: z.enum(["raw", "image"], {
    message: "Only documents or images are allowed",
  }),
  format: z
    .string()
    .optional()
    .nullable()
    .refine(
      (fmt) =>
        !fmt ||
        [
          "pdf",
          "doc",
          "docx",
          "txt",
          "jpg",
          "jpeg",
          "png",
          "webp",
        ].includes(fmt.toLowerCase()),
      {
        message:
          "Invalid file format. Allowed formats: PDF, DOC, DOCX, TXT, or images.",
      }
    ),
});

export type CloudinaryFile = z.infer<typeof CloudinaryFileSchema>;
export type CloudinaryImage = z.infer<typeof CloudinaryImageSchema>;
export type CloudinaryDoc = z.infer<typeof CloudinaryDocSchema>;
