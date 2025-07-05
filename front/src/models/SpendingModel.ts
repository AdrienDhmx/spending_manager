import type {CategoryModel} from "./CategoryModel.ts";
import {z} from "zod";

export interface SpendingModel {
    id?: string,
    userId?: string,
    date: Date,
    category: CategoryModel,
    label: string,
    description?: string,
    amount: number,
}

const SpendingSchema = z.object({
    date: z.date(),
    category: z.string().nonempty(),
    label: z.string().nonempty().max(100),
    description: z.string().max(250).optional(),
    amount: z.string()
        .nonempty("Amount is required")
        .transform(val => Number(val))
        .refine(val => !isNaN(val), {
            message: "Amount must be a valid number",
        })
        .refine(val => val >= 0, {
            message: "Amount must be positive"
        }),
});

export default SpendingSchema;