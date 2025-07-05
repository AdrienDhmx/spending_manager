import CategoryShema, {type CategoryModel} from "../../models/CategoryModel.ts";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "../ui/form.tsx";
import {Input} from "../ui/input.tsx";
import {SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle} from "../ui/sheet.tsx";
import {Button} from "../ui/button.tsx";
import {LucideLoader2} from "lucide-react";
import {useContext, useEffect, useState} from "react";
import FormSheetContext from "../../contexts/FormSheetContext.tsx";
import CategoryContext from "../../contexts/CategoryContext.tsx";
import { toast } from "sonner";

function CategoryForm() {
    const categoryContext = useContext(CategoryContext)!;
    const {
        data: category,
        close: closeSheet,
    } = useContext(FormSheetContext)!;

    const form = useForm<z.infer<typeof CategoryShema>>({
        resolver: zodResolver(CategoryShema)
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.reset({
            name: category?.name ?? '',
            color: category?.color
        })
    }, [category]);


    const onSubmit = async (data: CategoryModel) => {
        setLoading(true);
        let error: string | undefined;
        if (category) {
            error = await categoryContext.update({...data, id: category.id});
        } else {
            error = await categoryContext.create(data);
        }

        if (error) {
            toast.error(error);
        } else {
            closeSheet()
        }

        setLoading(false);
    }


    return (
        <Form {...form}>
            <form>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="text-xl">{category ? "Edit category" : "Create category"}</SheetTitle>
                    </SheetHeader>

                    <div className="px-4 flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Subscription" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <Input type={"color"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <SheetFooter>
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                            {loading && <LucideLoader2 className="spin-in" />}
                            {category ? "Save changes" : "Create"}
                        </Button>
                        <SheetClose asChild>
                            <Button variant="outline"
                                    onClick={() => closeSheet()}>
                                Cancel
                            </Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </form>
        </Form>
    )
}

export default CategoryForm;