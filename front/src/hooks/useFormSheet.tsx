import {useMemo, useState} from "react"


function useFormSheet<T>(){
    const [data, setData] = useState<T | undefined>(undefined);
    const [isOpen, setIsOpen] = useState(false)

    const open = (selectedData?: T) => {
        setData(selectedData);
        console.log(selectedData);
        setIsOpen(true)
    }

    const close = () => {
        setData(undefined);
        setIsOpen(false);
    }

    return useMemo(() => ({
        data,
        isOpen,

        open,
        close,
    }), [data, isOpen])
}

export default useFormSheet;