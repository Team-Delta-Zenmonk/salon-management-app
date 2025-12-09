import * as z from "zod";

export const ForgotPasswordSchema = z.object({
  email: z
    .string({ message: "Required" })
    .email({ message: "Invalid Email" })
    .max(50, { message: "Email Max Length Exceeded" }),
});

export type ForgotPasswordForm = z.infer<typeof ForgotPasswordSchema>;
