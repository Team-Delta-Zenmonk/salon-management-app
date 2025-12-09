import * as z from "zod";

export const OwnerSchema = z.object({
  owner_name: z.string().min(1, "Required"),
});

export type OwnerForm = z.infer<typeof OwnerSchema>;
