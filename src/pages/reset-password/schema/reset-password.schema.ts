import * as z from "zod";
import { VALIDATE_PATTERN } from "../../../common/validate-pattern";
import { FIELD_LIMITS } from "../../../common/field-limits";

export const ResetPasswordSchema = z
  .object({
    password: z
      .string({ message: "Required" })
      .min(8, { message: "Min 8 characters" })
      .max(FIELD_LIMITS.PASSWORD, { message: "Password Max Length Exceeded" })
      .regex(VALIDATE_PATTERN.uppercase, { message: "Need 1 uppercase letter" })
      .regex(VALIDATE_PATTERN.lowercase, { message: "Need 1 lowercase letter" })
      .regex(VALIDATE_PATTERN.digit, { message: "Need 1 number" })
      .regex(VALIDATE_PATTERN.specialChar, { message: "Need 1 special character" }),
    confirm_password: z
      .string({ message: "Required" })
      .min(1, { message: "Required" }),
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

export type ResetPasswordForm = z.infer<typeof ResetPasswordSchema>;
