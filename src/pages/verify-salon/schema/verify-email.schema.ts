import * as z from "zod";

export const VerifyEmailSchema = z.object({
  otp: z
    .string({ message: "Required" })
    .min(1, { message: "Required" })
    .min(6, { message: "Invalid OTP" })
});

export type VerifyEmailForm = z.infer<typeof VerifyEmailSchema>;
