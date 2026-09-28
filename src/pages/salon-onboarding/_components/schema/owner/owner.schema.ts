import * as z from "zod";
import { FIELD_LIMITS } from "@/common/field-limits";

export const OwnerSchema = z.object({
  owner_name: z.string().min(1, "Required").max(FIELD_LIMITS.NAME, `Maximum ${FIELD_LIMITS.NAME} characters`),
});

export type OwnerForm = z.infer<typeof OwnerSchema>;
