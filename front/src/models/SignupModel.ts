import * as z from "zod/v4";

export interface SignupModel {
    firstname: string,
    lastname: string,
    email: string,
    password: string,
}

const SignupSchema = z.object({
    firstname: z.string().min(2).max(50),
    lastname: z.string().min(2).max(50),
    email: z.email(),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(20, { message: "Password can be at most 20 characters long" })
        .refine((password) => /[A-Z]/.test(password), {
            message: "Password must contain at least 1 uppercase character",
        })
        .refine((password) => /[a-z]/.test(password), {
            message: "Password must contain at least 1 lowercase character",
        })
        .refine((password) => /[0-9]/.test(password), {
            message: "Password must contain at least 1 number",
        })
        .refine((password) => /[!@#$%^&*]/.test(password), {
            message: "Password must contain at least 1 special character",
        }),
});

export default SignupSchema;