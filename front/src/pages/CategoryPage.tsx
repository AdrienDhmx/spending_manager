import useCategory from "../hooks/UseCategory.tsx";
import {
    Sheet,
} from "../components/ui/sheet.tsx";
import CategoryCard from "../components/category/CategoryCard.tsx";
import type {CategoryModel} from "../models/CategoryModel.ts";
import { Button } from "../components/ui/button.tsx";
import CategoryForm from "../components/category/CategoryForm.tsx";
import { LucidePlus} from "lucide-react";
import {toast} from "sonner";
import CategoryContext from "../contexts/CategoryContext.tsx";
import FormSheetContext from "../contexts/FormSheetContext.tsx";
import useFormSheet from "../hooks/useFormSheet.tsx";


function CategoryPage() {
    const categoryContext = useCategory();
    const formSheetContext = useFormSheet<CategoryModel>();

    if (categoryContext.error) {
        toast.error(categoryContext.error);
    }

    return (
        <CategoryContext.Provider value={categoryContext} >
            <FormSheetContext.Provider value={formSheetContext}>
                <div className="p-4">
                    <Sheet open={formSheetContext.isOpen} onOpenChange={formSheetContext.close}>
                        <h1 className="text-4xl font-serif font-normal pb-4">
                            Your Categories
                        </h1>

                        <div className="flex justify-end">
                            <Button onClick={() => formSheetContext.open()}>
                                <LucidePlus />
                                Add Category
                            </Button>
                        </div>

                        <div className="py-4 flex flex-col gap-4">
                            {categoryContext.loading && (
                                <p>Loading your categories...</p>
                            )}

                            {categoryContext.categories.map(category => (
                                <CategoryCard category={category} />
                            ))}
                        </div>

                        <CategoryForm />
                    </Sheet>
                </div>
            </FormSheetContext.Provider>
        </CategoryContext.Provider>
    )
}

export default CategoryPage;