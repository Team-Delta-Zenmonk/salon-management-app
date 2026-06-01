import * as z from "zod";
import { CloudinaryFileSchema } from "../../../../common/cloudinary.schema";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { GENDER } from "../../../../common/enums/gender.enum";
import { VALIDATE_PATTERN } from "../../../../common/validate-pattern";

dayjs.extend(customParseFormat);

const DATE_FORMAT = "DD-MM-YYYY";

const parseDateString = (val: any): dayjs.Dayjs => {
  if (typeof val === "string" && val) {
    const parsed = dayjs(val, DATE_FORMAT, true);
    if (parsed.isValid()) return parsed;
    return dayjs(val);
  }
  return dayjs(val);
};

const BusinessDaySchema = z
  .object({
    start_time: z.string().regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: "Valid time (HH:MM) required",
    }),
    end_time: z.string().regex(/^([0-1]?\d|2[0-3]):[0-5]\d$/, {
      message: "Valid time (HH:MM) required",
    }),
  })
  .refine(
    (data) => {
      if (!data.start_time || !data.end_time) return true;
      const [startHours, startMinutes] = data.start_time.split(":").map(Number);
      const [endHours, endMinutes] = data.end_time.split(":").map(Number);
      return endHours * 60 + endMinutes > startHours * 60 + startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  )
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
  first_name: z.string({ message: "Required" }).min(1, { message: "Required" }).max(50, { message: "Max 50 characters" }).regex(VALIDATE_PATTERN.alphabet, { message: "Only alphabets are allowed" }),
  last_name: z.string({ message: "Required" }).min(1, { message: "Required" }).max(50, { message: "Max 50 characters" }).regex(VALIDATE_PATTERN.alphabet, { message: "Only alphabets are allowed" }),
  email: z
    .string({ message: "Required" })
    .min(1, { message: "Required" })
    .email({ message: "Invalid email" }),
  phone_number: z
    .string({ message: "Required" })
    .min(1, { message: "Required" })
    .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" }),
  additional_phone_number: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^\d{10}$/.test(val),
      { message: "Phone number must be exactly 10 digits" }
    ),
  dob: z
    .any()
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Required",
    })
    .refine(
      (val: Dayjs | string) => {
        if (!val) return true;
        const date = parseDateString(val);
        return (
          date.isValid() &&
          date.year() >= 1900 &&
          !date.isAfter(dayjs().endOf("day"), "day")
        );
      },
      { message: "Invalid date" }
    ),
  title: z.string({ message: "Required" }).min(1, { message: "Required" }).max(50, { message: "Max 30 characters" }).regex(VALIDATE_PATTERN.alphabet, { message: "Only alphabets are allowed " }),
  joining_date: z
    .any()
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "Required",
    })
    .refine(
      (val: Dayjs | string) => {
        if (!val) return true;
        return parseDateString(val).isValid();
      },
      { message: "Invalid date" }
    ),

  end_date: z
    .any()
    .optional()
    .refine(
      (val: Dayjs | string) => {
        if (!val) return true;
        return parseDateString(val).isValid();
      },
      { message: "Invalid date" }
    ),

  address: z.string({ message: "Required" }).min(1, { message: "Required" }).max(100, { message: "Address must be less than 100 characters" }).regex(VALIDATE_PATTERN.alphaNumericSpecialWithSpace, { message: "Invalid characters in address" }),
  emergency_contact: z.object({
    name: z.string({ message: "Required" }).min(1, { message: "Required" }),
    phone: z
      .string({ message: "Required" })
      .min(1, { message: "Required" })
      .regex(/^\d{10}$/, { message: "Phone number must be exactly 10 digits" }),
  }),
  gender: z.enum(Object.values(GENDER), {
    message: "Required",
  }),
  photos: CloudinaryFileSchema.nullable().optional(),
  active_hours: ActiveHoursSchema.optional(),
});

export type StaffForm = z.infer<typeof StaffSchema>;
