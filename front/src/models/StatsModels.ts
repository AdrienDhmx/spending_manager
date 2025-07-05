import type {CategoryModel} from "./CategoryModel.ts";

export type TimePeriod = 'day' | 'week' | 'month' | 'year';

export interface AmountSpentPerTimePeriod {
    date: Date;
    amount: number;
}

export interface AmountSpentPerTimePeriodPerCategory {
    totalAmount: number,
    totalCount: number,
    amountPerCategory: AmountSpendPerCategory[];
}

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