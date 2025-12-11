import * as z from "zod";
import { VALIDATE_PATTERN } from "../../../common/validate-pattern";

export const SignUpSchema = z
  .object({
    salon_name: z.string({ message: "Required" }).min(1, "Required"),
    email: z
      .string({ message: "Required" })
      .email({ message: "Invalid Email" })
      .max(50, { message: "Email Max Length Exceeded" }),
    password: z
      .string({ message: "Required" })
      .min(8, { message: "Min 8 characters" })
      .regex(VALIDATE_PATTERN.uppercase, { message: "Need 1 uppercase letter" })
      .regex(VALIDATE_PATTERN.lowercase, { message: "Need 1 lowercase letter" })
      .regex(VALIDATE_PATTERN.specialChar, { message: "Need 1 special character" }),
    confirm_password: z.string({ message: "Required" }).min(1, { message: "Required" }),
  })
  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Password Mismatch",
        path: ["confirm_password"],
      });
    }
  });

export type SignUpForm = z.infer<typeof SignUpSchema>;
