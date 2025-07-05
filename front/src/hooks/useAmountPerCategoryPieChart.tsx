import {useCallback, useEffect, useState} from "react";
import type { AmountSpentPerTimePeriodPerCategory, TimePeriod} from "../models/StatsModels.ts";
import api from "../utils/ApiUtils.ts";


function useAmountPerCategoryPieChart() {
    const [data, setData] = useState<AmountSpentPerTimePeriodPerCategory | undefined>(undefined);
    const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
    const [endDate, setEndDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const refresh = useCallback(() => {
        setLoading(true);
        api.get(`spending/stats/pie?timePeriod=${timePeriod}&endDate=${endDate.toISOString()}`)
            .then(response => response.json())
            .then(data => {
                setData(data as AmountSpentPerTimePeriodPerCategory)
            })
            .catch(error => setError(error))
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

export default useAmountPerCategoryPieChart;