import * as z from "zod";

export const OwnerSchema = z.object({
  owner_name: z.string().min(1, "Required").max(30, "Maximum 30 characters"),
});

export type OwnerForm = z.infer<typeof OwnerSchema>;
