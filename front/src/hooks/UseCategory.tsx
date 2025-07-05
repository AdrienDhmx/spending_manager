import type {CategoryModel} from "../models/CategoryModel.ts";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import api from "../utils/ApiUtils.ts";
import type {CategoryContextModel} from "../contexts/CategoryContext.tsx";
import AuthContext from "../contexts/AuthContext.tsx";

const useCategory = () : CategoryContextModel => {
    const {user} = useContext(AuthContext);
    const [categories, setCategories] = useState<CategoryModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const refresh = useCallback(async () => {
        setLoading(true);
        setError(undefined);
        try {
            const response = await api.get("category");
            const data = await response.json();
            setCategories(data as CategoryModel[]);
        } catch (err) {
            setError("Failed to fetch categories");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const create = async (category: CategoryModel) => {
        try {
            await api.post("category", { json: category });
            await refresh();
            return undefined;
        } catch {
            return "Failed to delete category" ;
        }
    };

    const update = async (category: CategoryModel)  => {
        try {
            await api.put('category', { json: {...category, userId: user.id} });
            await refresh();
            return undefined;
        } catch {
            return "Failed to delete category" ;
        }
    };

    const remove = async (category: CategoryModel) => {
        try {
            await api.delete(`category/${category.id}`);
            await refresh();
            return undefined;
        } catch {
            return "Failed to delete category" ;
        }
    };

    return useMemo(() => ({
        categories,
        loading,
        error,
        refresh,
        create,
        update,
        remove,
    }), [categories, loading, error]);
};

export default useCategory;
