import {useCallback, useEffect, useState} from "react";
import type { AmountSpentPerTimePeriodPerCategory, TimePeriod} from "../models/StatsModels.ts";
import api from "../utils/ApiUtils.ts";


function useAmountPerTimePeriodPerCategoryBarChart() {
    const [data, setData] = useState<AmountSpentPerTimePeriodPerCategory[]>([]);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const refresh = useCallback(() => {
        setLoading(true);
        api.get(`spending/stats/bars?timePeriod=${timePeriod}&endDate=${endDate.toISOString()}`)
            .then(response => response.json())
            .then(data => {
                setData(data as AmountSpentPerTimePeriodPerCategory)
            })
            .catch(error => setError(error.toString()))
            .finally(() => setLoading(false));
    }, [timePeriod, endDate]);

    useEffect(() => {
        refresh();
    }, [timePeriod, endDate]);

    return {
        data,
        timePeriod,
        endDate,
        loading,
        error,
        refresh,
        setTimePeriod,
        setEndDate,
    }
}

export default useAmountPerTimePeriodPerCategoryBarChart;