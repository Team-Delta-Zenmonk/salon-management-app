import * as z from "zod";
import { CloudinaryFileSchema } from "../../../../common/cloudinary.schema";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { GENDER } from "../../../../common/enums/gender.enum";

const BusinessDaySchema = z
  .object({
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Valid time (HH:MM) required",
    }),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
      message: "Valid time (HH:MM) required",
    }),
  })
  .nullable()
  .optional();

const ActiveHoursSchema = z
  .object({
    monday: BusinessDaySchema,
    tuesday: BusinessDaySchema,
    wednesday: BusinessDaySchema,
    thursday: BusinessDaySchema,
    friday: BusinessDaySchema,
    saturday: BusinessDaySchema,
    sunday: BusinessDaySchema,
  })
  .optional();

export const StaffSchema = z.object({
  first_name: z.string({ message: "Required" }).min(2, { message: "Minimum 2 characters" }),
  last_name: z.string({ message: "Required" }).min(2, { message: "Minimum 2 characters" }),
  email: z.string({ message: "Required" }).email({ message: "Valid email required" }),
  phone_number: z.string({ message: "Required" }).min(10, { message: "Minimum 10 digits" }),
  additional_phone_number: z.string({ message: "Required" }).min(10, { message: "Minimum 10 digits" }),
  dob: z
    .any()
    .refine((val) => val, {
      message: "required",
    })
    .refine(
      (val: Dayjs | string) => {
        const date = dayjs(val);
        return date?.isValid() && date?.year() > 1899 && !date?.isAfter(dayjs(), "day");
      },
      {
        message: "invalidDate",
      }
    ),
  title: z.string({ message: "Required" }).min(2, { message: "Minimum 2 characters" }),
  joining_date: z.string({ message: "Required" }).regex(/^\d{2}-\d{2}-\d{4}$/, { message: "DD-MM-YYYY format" }),
  end_date: z.string().optional(),
  address: z.string({ message: "Required" }).min(5, { message: "Address too short" }),
  emergency_contact: z.object({
    name: z.string({ message: "Emergency contact name required" }),
    phone: z.string({ message: "Emergency contact phone required" }).min(10),
  }),
  gender: z.enum(Object.values(GENDER), {
    message: "Required",
  }),
  photos: CloudinaryFileSchema.nullable().optional(),
  active_hours: ActiveHoursSchema.optional(),
});

export type StaffForm = z.infer<typeof StaffSchema>;
