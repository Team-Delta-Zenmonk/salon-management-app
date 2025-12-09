import * as z from "zod";
import { OwnerSchema } from "../_components/schema/owner/owner.schema";
import { SalonSchema } from "../_components/schema/salon/salon.schema";
import { AddressSchema } from "../_components/schema/address/address.schema";

export const SalonOnboardingSchema = z.object({
  owner: OwnerSchema,
  salon: SalonSchema,
  address: AddressSchema,
});

export type SalonOnboardingForm = z.infer<typeof SalonOnboardingSchema>;
