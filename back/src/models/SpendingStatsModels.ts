import {CategoryModel} from "./CategoryModel";

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

export interface AmountSpendPerCategory {
    category: CategoryModel;
    totalAmount: number;
    totalCount: number;
}

export interface AmountSpentPerTimePeriodPerCategory {
    date: string;
    totalAmount: number;
    totalCount: number;
    amountPerCategory: AmountSpendPerCategory[];
}