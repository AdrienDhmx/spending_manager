import AmountPerCategoryPieChart from "../components/dashboard/AmountPerCategoryPieChart.tsx";
import {useContext} from "react";
import AuthContext from "../contexts/AuthContext.tsx";
import AmountPerTimePeriodPerCategoryBarChart from "../components/dashboard/AmountPerTimePeriodPerCategoryBarChart.tsx";

function DashboardPage() {
    const {user} = useContext(AuthContext);

    return (
        <div className="p-4 pt-2 flex flex-col gap-4">
            <h1>Hello, {user?.firstname}</h1>
            <div className="w-full h-full grid grid-cols-1 gap-4 md:grid-cols-2">
                <AmountPerCategoryPieChart />
                <AmountPerTimePeriodPerCategoryBarChart />
            </div>
        </div>
    )
}

export default DashboardPage;