import type {SpendingModel} from "../models/SpendingModel.ts";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import api from "../utils/ApiUtils.ts";
import type {SpendingContextModel} from "../contexts/SpendingContext.tsx";
import AuthContext from "../contexts/AuthContext.tsx";

const useSpending = () : SpendingContextModel => {
    const {user} = useContext(AuthContext);
    const [spendings, setSpendings] = useState<SpendingModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const response = await api.get('spending');
            const data = await response.json();
            setSpendings(data as SpendingModel[]);
        } catch (err) {
            setError("Failed to fetch spendings");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const create = async (spending: SpendingModel) => {
        try {
            await api.post("spending", { json: spending });
            await refresh();
            return undefined;
        } catch {
            return "Failed to delete spending" ;
        }
    };

    const update = async (spending: SpendingModel)  => {
        try {
            await api.put('spending', { json: {...spending, userId: user?.id} });
            await refresh();
            return undefined;
        } catch {
            return "Failed to delete spending" ;
        }
    };

    const remove = async (spending: SpendingModel) => {
        try {
            await api.delete(`spending/${spending.id}`);
            await refresh();
            return undefined;
        } catch {
            return "Failed to delete spending" ;
        }
    };

    return useMemo(() => ({
        spendings,
        loading,
        error,
        refresh,
        create,
        update,
        remove,
    }), [spendings, loading, error, user]);
};

export default useSpending;
