import { z } from "zod";
import { BOOKING_STATUS } from "../../../common/enums/booking-status.enum";
import { VALIDATE_PATTERN } from "../../../common/validate-pattern";

export const bookingServiceSchema = z.object({
  service_id: z.coerce.number({ message: "Required" }),
  staff_id: z.coerce.number({ message: "Required" }),
});

export const bookingSchema = z.object({
  customer_name: z.string({ message: "Required" }).min(1, { message: "Required" }).max(30, { message: "Max 30 characters" }).regex(VALIDATE_PATTERN.alphabet, { message: "Only alphabets are allowed" }),
  customer_phone: z.string({ message: "Required" }).min(10, { message: "Phone number must be at least 10 digits" }).regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" }),
  services: z.array(bookingServiceSchema).min(1, { message: "At least one service is required" }),
  booking_date: z.any(),
  booking_start_time: z.string({ message: "Required" }).min(1, { message: "Required" }),
  status: z.enum(Object.values(BOOKING_STATUS) as [string, ...string[]]).optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;
export type BookingServiceFormValues = z.infer<typeof bookingServiceSchema>;
