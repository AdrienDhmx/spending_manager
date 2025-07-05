import {z} from "zod";


export interface CategoryModel {
    id?: string,
    userId?: string,
    name: string,
    color: string,
}

const CategoryShema = z.object({
    name: z.string().min(2).max(50),
    color: z.string(),
});

export default CategoryShema;