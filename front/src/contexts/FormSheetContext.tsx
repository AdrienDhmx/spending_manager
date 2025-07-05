import {createContext} from "react";


export interface FormSheetContextModel<T> {
    data: T | undefined,
    isOpen: boolean,
    open: (data?: T) => void,
    close: () => void,
}

const FormSheetContext = createContext<FormSheetContextModel<any> | undefined>(undefined);

export default FormSheetContext;