import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card.tsx";
import type { TimePeriod} from "../../models/StatsModels.ts";
import {
    ChartContainer,
    ChartTooltip,
    type ChartConfig,
    ChartTooltipContent,
    ChartLegendContent,
    ChartLegend
} from "../ui/chart.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import {Bar, BarChart, Cell, Legend, Pie, PieChart, Tooltip, XAxis, YAxis} from "recharts";
import useAmountPerCategoryPieChart from "../../hooks/useAmountPerCategoryPieChart.tsx";
import CalendarPicker from "../CalendarPicker.tsx";
import useAmountPerTimePeriodPerCategoryBarChart from "../../hooks/useAmountTimePeriodPerCategoryBarChart.tsx";
import useCategory from "../../hooks/UseCategory.tsx";


function AmountPerTimePeriodPerCategoryBarChart() {
    const {
        data,
        loading,
        error,
        timePeriod,
        setTimePeriod,
        endDate,
        setEndDate,
    } = useAmountPerTimePeriodPerCategoryBarChart();
    const {categories} = useCategory();

    if (loading) {
        return (
            <p>Loading Stats...</p>
        )
    }

    if (error || !data) {
        return (
            <p>{error.toString()}</p>
        )
    }

    const chartConfig = { } satisfies ChartConfig;
    categories.forEach(category => {
        chartConfig[category.id] = {
            label: category.name,
            color: category.color,
        }
    })

    return (
        <Card className="p-4">
            <CardHeader>
                <CardTitle>Spending Per Category Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
                <div className="flex items-center justify-center gap-4">
                    <Select
                        value={timePeriod}
                        onValueChange={(v) => setTimePeriod(v as TimePeriod)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Select granularity" />
                        </SelectTrigger>
                        <SelectContent>
                            {["day", "week", "month", "year"].map((g) => (
                                <SelectItem key={g} value={g}>
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <CalendarPicker date={endDate} setDate={setEndDate} />
                </div>

                <ChartContainer config={chartConfig} width="100%" height="100%">
                    <BarChart data={data ?? []}>
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        {categories.map((category, index) => (
                            <Bar
                                key={category.id}
                                dataKey={category.id}
                                stackId="a"
                                fill={category.color}
                                radius={index === categories.length - 1 ? [4, 4, 0, 0] : undefined}
                            />
                        ))}
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default AmountPerTimePeriodPerCategoryBarChart;