import {createContext} from "react";
import type {SpendingModel} from "../models/SpendingModel.ts";

export interface SpendingContextModel {
    spendings: SpendingModel[],
    refresh: () => void,
    create: (category: SpendingModel) => Promise<string | undefined>,
    update: (category: SpendingModel) => Promise<string | undefined>,
    remove: (category: SpendingModel) => Promise<string | undefined>,
    loading: boolean,
    error?: string,
}


const SpendingContext  = createContext<SpendingContextModel|undefined>(undefined);

export default SpendingContext;