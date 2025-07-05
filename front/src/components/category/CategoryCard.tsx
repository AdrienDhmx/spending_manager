import {Card, CardAction, CardHeader, CardTitle} from "../ui/card.tsx";
import {Avatar, AvatarFallback} from "../ui/avatar.tsx";
import type { CategoryModel } from "../../models/CategoryModel.ts";
import {Button} from "../ui/button.tsx";
import { LucideEdit, LucideLoader2, LucideTrash2} from "lucide-react";
import {useContext, useState} from "react";
import CategoryContext from "../../contexts/CategoryContext.tsx";
import FormSheetContext from "../../contexts/FormSheetContext.tsx";
import {toast} from "sonner";

export interface CategoryCardProps {
    category: CategoryModel
}

function CategoryCard({category}: CategoryCardProps) {
    const {remove} = useContext(CategoryContext)!;
    const {
        open: openSheet,
    } = useContext(FormSheetContext)!;
    const [loading, setLoading] = useState(false);

    const onEdit = () => {
        openSheet(category);
    }

    const onDelete = async () => {
        setLoading(true);
        const error = await remove(category);
        if (error) {
            toast.error(error);
        }
        setLoading(false);
    }

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <div className="flex gap-4 items-center">
                    <Avatar>
                        <AvatarFallback style={{backgroundColor: category.color}}/>
                    </Avatar>
                    <CardTitle>{category.name}</CardTitle>
                </div>
                <CardAction className="flex gap-2">
                    <Button onClick={onEdit}>
                        <LucideEdit />
                        Edit
                    </Button>
                    <Button onClick={onDelete}
                            variant="destructive">
                        {loading ? <LucideLoader2 className="spin-in" /> : <LucideTrash2 />}
                        Delete
                    </Button>
                </CardAction>
            </CardHeader>
        </Card>
    )
}

export default CategoryCard;