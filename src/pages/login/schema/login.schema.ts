import * as z from "zod";
import { FIELD_LIMITS } from "@/common/field-limits";
import { VALIDATE_PATTERN } from "@/common/validate-pattern";

export const LoginSchema = z.object({
  email: z
    .string({ message: "Required" })
    .email({ message: "Invalid Email" })
    .regex(VALIDATE_PATTERN.email, { message: "Invalid Email" })
    .max(FIELD_LIMITS.EMAIL, { message: "Email Max Length Exceeded" }),
  password: z.string({ message: "Required" }).min(1, { message: "Required" }).min(8, { message: "Invalid Password" }).max(FIELD_LIMITS.PASSWORD, { message: "Password Max Length Exceeded" }),
});

export type LoginForm = z.infer<typeof LoginSchema>;
