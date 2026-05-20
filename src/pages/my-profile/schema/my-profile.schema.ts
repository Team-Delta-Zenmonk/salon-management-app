import * as z from "zod";
import { VALIDATE_PATTERN } from "../../../common/validate-pattern";

const BusinessDaySchema = z.object({
  start_time: z.string().min(1, "Required"),
  end_time: z.string().min(1, "Required"),
}).nullable();

export const MyProfileSchema = z.object({
  name: z.string()
    .min(1, "Required")
    .max(30, "Max 30 characters")
    .regex(VALIDATE_PATTERN.alphabet, "Only letters and spaces allowed"),
  owner_name: z.string()
    .min(1, "Required")
    .max(30, "Max 30 characters")
    .regex(VALIDATE_PATTERN.alphabet, "Only letters and spaces allowed"),
  email: z.string().email(),
  phone: z.string()
    .min(1, "Required")
    .length(10, "Must be 10 digits")
    .regex(VALIDATE_PATTERN.number, "Only numbers allowed"),
  about: z.string().max(100, "Maximum 100 characters").regex(VALIDATE_PATTERN.alphabet, "Only letters and spaces allowed"),
  type: z.string(),
  address: z.object({
    address: z.string().min(1, "Required"),
    map_link: z.string().optional().nullable(),
    latitude: z.union([z.string(), z.number()]).optional().nullable(),
    longitude: z.union([z.string(), z.number()]).optional().nullable(),
  }),
  logo: z.any().nullable(),
  photos: z.array(z.any()),
  business_hours: z.object({
    monday: BusinessDaySchema,
    tuesday: BusinessDaySchema,
    wednesday: BusinessDaySchema,
    thursday: BusinessDaySchema,
    friday: BusinessDaySchema,
    saturday: BusinessDaySchema,
    sunday: BusinessDaySchema,
  }),
});

export type SalonProfileForm = z.infer<typeof MyProfileSchema>;
