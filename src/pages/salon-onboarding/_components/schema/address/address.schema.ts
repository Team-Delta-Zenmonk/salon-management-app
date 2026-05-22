import * as z from "zod";

export const AddressSchema = z.object({
  address: z.string({ message: "Required" }).min(10, "Address is too short"),
  map_link: z.url("Invalid map link").optional().or(z.literal("")),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

export type AddressForm = z.infer<typeof AddressSchema>;
