import { z } from "zod";
import { BOOKING_STATUS } from "../../../common/enums/booking-status.enum";
import { VALIDATE_PATTERN } from "../../../common/validate-pattern";
import { FIELD_LIMITS } from "../../../common/field-limits";

export const bookingServiceSchema = z.object({
  service_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number({ message: "Required" }).int().positive({ message: "Required" })
  ),
  staff_id: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || Number(val) <= 0 ? null : Number(val)),
    z.number().int().positive().nullable().optional()
  ),
});

export const bookingSchema = z.object({
  customer_name: z.string({ message: "Required" }).min(1, { message: "Required" }).max(FIELD_LIMITS.NAME, { message: `Max ${FIELD_LIMITS.NAME} characters` }).regex(VALIDATE_PATTERN.alphaNumericSpecialWithSpace, { message: "Only alphabets with numbers and special characters are allowed" }),
  customer_phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      { message: "Phone number must be exactly 10 digits" }
    ),
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
  status: z.enum(Object.values(BOOKING_STATUS) as [string, ...string[]], {
    message: "Status is required",
  }),
  payment_preference: z.enum(["pay_at_venue", "partial_deposit", "full_upfront"], { message: "Payment preference is required" }),
  is_walk_in: z.boolean().default(false),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type BookingServiceFormValues = z.infer<typeof bookingServiceSchema>;
