import SpendingContext from "../contexts/SpendingContext.tsx";
import useSpending from "../hooks/UseSpending.tsx";
import useFormSheet from "../hooks/useFormSheet.tsx";
import type {SpendingModel} from "../models/SpendingModel.ts";
import FormSheetContext from "../contexts/FormSheetContext.tsx";
import {Sheet} from "../components/ui/sheet.tsx";
import {Button} from "../components/ui/button.tsx";
import {LucidePlus} from "lucide-react";
import SpendingForm from "../components/spending/SpendingForm.tsx";
import CategoryContext from "../contexts/CategoryContext.tsx";
import useCategory from "../hooks/UseCategory.tsx";
import SpendingTable from "../components/spending/SpendingTable.tsx";
import {Card, CardContent} from "../components/ui/card.tsx";


function SpendingPage() {
    const spendingContext = useSpending();
    const categoryContext = useCategory();
    const formSheetContext = useFormSheet<SpendingModel>();

    return (
        <SpendingContext.Provider value={spendingContext}>
            <CategoryContext.Provider value={categoryContext}>
                <FormSheetContext.Provider value={formSheetContext}>
                    <div className="p-4">
                        <Sheet open={formSheetContext.isOpen} onOpenChange={formSheetContext.close}>
                            <h1 className="pb-4">
                                Your Spendings
                            </h1>

                            <div className="flex justify-end">
                                <Button onClick={() => formSheetContext.open()}>
                                    <LucidePlus />
                                    Add Spending
                                </Button>
                            </div>

                            <div  className="py-4 flex flex-col gap-4">
                                <Card>
                                    <CardContent>
                                        {spendingContext.loading && (
                                            <p>Loading your spending...</p>
                                        )}

                                        <SpendingTable />
                                    </CardContent>
                                </Card>
                            </div>

                            <SpendingForm/>
                        </Sheet>
                    </div>
                </FormSheetContext.Provider>
            </CategoryContext.Provider>
        </SpendingContext.Provider>
    )
}

export default SpendingPage;