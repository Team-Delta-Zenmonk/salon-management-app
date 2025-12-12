import * as z from "zod";

export const LoginSchema = z.object({
  email: z
    .string({ message: "Required" })
    .email({ message: "Invalid Email" })
    .max(50, { message: "Email Max Length Exceeded" }),
  password: z.string({ message: "Required" }).min(1, { message: "Required" }).min(8, { message: "Invalid Password" }),
});

export type LoginForm = z.infer<typeof LoginSchema>;
