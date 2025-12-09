import * as z from "zod";

export const ResetPasswordSchema = z
  .object({
    password: z.string({ message: "Required" }).min(1, { message: "Required" }).min(6, { message: "Invalid Password" }),
    confirm_password: z
      .string({ message: "Required" })
      .min(1, { message: "Required" })
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
