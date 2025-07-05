import {CategoryModel} from "./CategoryModel";

export interface SpendingPresenterModel {
    id?: string,
    userId: string,
    date: Date,
    category: CategoryModel,
    label: string,
    description?: string,
    amount: number,
}

export interface SpendingModel {
    id?: string,
    userId: string,
    date: Date,
    categoryId: string,
    label: string,
    description?: string,
    amount: number,
}