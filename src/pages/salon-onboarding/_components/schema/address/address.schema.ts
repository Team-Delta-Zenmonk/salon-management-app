import * as z from "zod";
import { FIELD_LIMITS } from "../../../../../common/field-limits";

export const AddressSchema = z.object({
  address: z.string({ message: "Required" }).min(10, "Address is too short").max(FIELD_LIMITS.ADDRESS, `Address cannot exceed ${FIELD_LIMITS.ADDRESS} characters`),
  map_link: z
    .string({ message: "Google Maps link is required" })
    .min(1, "Google Maps link is required")
    .url("Invalid Google Maps link")
    .max(FIELD_LIMITS.URL, `Map link cannot exceed ${FIELD_LIMITS.URL} characters`),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type AddressForm = z.infer<typeof AddressSchema>;
