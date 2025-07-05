import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card.tsx";
import type { TimePeriod} from "../../models/StatsModels.ts";
import {ChartContainer, ChartTooltip, type ChartConfig, ChartTooltipContent} from "../ui/chart.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import {Cell, Legend, Pie, PieChart} from "recharts";
import useAmountPerCategoryPieChart from "../../hooks/useAmountPerCategoryPieChart.tsx";
import CalendarPicker from "../CalendarPicker.tsx";

const chartConfig = {
    amount: { label: "Spending", color: "var(--chart-1)" },
} satisfies ChartConfig;

function AmountPerCategoryPieChart() {
    const {
        data,
        loading,
        error,
        timePeriod,
        setTimePeriod,
        endDate,
        setEndDate,
    } = useAmountPerCategoryPieChart();


    if (loading) {
        return (
            <p>Loading Stats...</p>
        )
    }

    if (error || !data) {
        return (
            <p>{error?.toString() ?? "Unknown error"}</p>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Spending per Category</CardTitle>
                <CardDescription>
                    Total: <strong>{data!.totalAmount!}</strong> this {timePeriod}
                </CardDescription>
            </CardHeader>

            <CardContent>
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

                <ChartContainer config={chartConfig} className="min-h-[300px] w-full flex justify-center">
                    <PieChart width={300} height={300}>
                        <Pie
                            data={data!.amountPerCategory}
                            dataKey="totalAmount"
                            nameKey="category.name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="var(--chart-1)"
                            label={({ name, percent }) =>
                                `${name}: ${(percent! * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                        >
                            {data!.amountPerCategory?.map((entry, index) => (
                                <Cell key={`cell-${index}`} name={entry.category.name} fill={entry.category.color} />
                            ))}
                        </Pie>
                        <Legend />
                        <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}

export default AmountPerCategoryPieChart;