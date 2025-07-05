import {createContext} from "react";
import type {CategoryModel} from "../models/CategoryModel.ts";

export interface CategoryContextModel {
    categories: CategoryModel[],
    refresh: () => void,
    create: (category: CategoryModel) => Promise<string | undefined>,
    update: (category: CategoryModel) => Promise<string | undefined>,
    remove: (category: CategoryModel) => Promise<string | undefined>,
    loading: boolean,
    error?: string,
}


const CategoryContext  = createContext<CategoryContextModel|undefined>(undefined);

export default CategoryContext;