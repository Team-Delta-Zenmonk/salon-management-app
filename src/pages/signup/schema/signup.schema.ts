import * as z from "zod";

export const SignUpSchema = z
  .object({
    salon_name: z.string({ message: "Required" }).min(1, "Required"),
    email: z
      .string({ message: "Required" })
      .email({ message: "Invalid Email" })
      .max(50, { message: "Email Max Length Exceeded" }),
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

export type SignUpForm = z.infer<typeof SignUpSchema>;
