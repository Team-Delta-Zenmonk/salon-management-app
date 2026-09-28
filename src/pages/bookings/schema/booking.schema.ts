import { z } from "zod";
import { BOOKING_STATUS } from "../../../common/enums/booking-status.enum";
import { VALIDATE_PATTERN } from "../../../common/validate-pattern";
import { FIELD_LIMITS } from "../../../common/field-limits";

export const bookingServiceSchema = z.object({
  service_id: z.coerce.number({ message: "Required" }),
  staff_id: z.coerce.number().optional().nullable(),
});

export const bookingSchema = z.object({
  customer_name: z.string({ message: "Required" }).min(1, { message: "Required" }).max(FIELD_LIMITS.NAME, { message: `Max ${FIELD_LIMITS.NAME} characters` }).regex(VALIDATE_PATTERN.alphabet, { message: "Only alphabets are allowed" }),
  customer_phone: z.string({ message: "Required" }).min(10, { message: "Phone number must be at least 10 digits" }).max(FIELD_LIMITS.PHONE, { message: `Max ${FIELD_LIMITS.PHONE} digits` }).regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" }),
  services: z.array(bookingServiceSchema).min(1, { message: "At least one service is required" }),
  booking_date: z.any().refine(
    (val) => {
      if (val === null || val === undefined || val === "") return false;
      if (typeof val === "string" && val.trim() === "") return false;
      return true;
    },
    { message: "Required" }
  ),
  booking_start_time: z.string({ message: "Required" }).min(1, { message: "Required" }),
  status: z.enum(Object.values(BOOKING_STATUS) as [string, ...string[]]).optional(),
  payment_preference: z.enum(["pay_at_venue", "partial_deposit", "full_upfront"], { message: "Payment preference is required" }),
  is_walk_in: z.boolean().default(false),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type BookingServiceFormValues = z.infer<typeof bookingServiceSchema>;
