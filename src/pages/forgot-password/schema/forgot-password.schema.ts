import * as z from "zod";
import { FIELD_LIMITS } from "@/common/field-limits";
import { VALIDATE_PATTERN } from "@/common/validate-pattern";

export const ForgotPasswordSchema = z.object({
  email: z
    .string({ message: "Required" })
    .email({ message: "Invalid Email" })
    .regex(VALIDATE_PATTERN.email, { message: "Invalid Email" })
    .max(FIELD_LIMITS.EMAIL, { message: "Email Max Length Exceeded" }),
});

export type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;
