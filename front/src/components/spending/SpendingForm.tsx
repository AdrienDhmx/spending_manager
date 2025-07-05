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
import { toast } from "sonner";
import SpendingContext from "../../contexts/SpendingContext.tsx";
import SpendingSchema, {type SpendingModel} from "../../models/SpendingModel.ts";
import {DatePicker} from "../DatePicker.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "../ui/select.tsx";
import CategoryContext from "../../contexts/CategoryContext.tsx";
import {Textarea} from "../ui/textarea.tsx";

interface FormSpendingModel {
    date: Date,
    label: string,
    description?: string,
    amount: number,
    category: string
}

function SpendingForm() {
    const {create, update} = useContext(SpendingContext)!;
    const {categories} = useContext(CategoryContext)!;
    const {
        data: spending,
        close: closeSheet,
    } = useContext(FormSheetContext)!;

    const form = useForm<z.infer<typeof SpendingSchema>>({
        resolver: zodResolver(SpendingSchema),
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.reset({
            date: spending?.date && new Date(spending.date) || new Date(),
            label: spending?.label ?? '',
            description: spending?.description,
            amount: spending?.amount?.toString() ?? '0.0',
            category: spending?.category?.id,
        });
    }, [spending]);

    const onSubmit = async (data: FormSpendingModel) => {
        setLoading(true);
        const category = categories.find(c => c.id === data.category)!;
        let error: string | undefined;
        if (spending) {
            error = await update({...data, id: spending.id, category } as SpendingModel);
        } else {
            error = await create({...data, category} as SpendingModel);
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
                <SheetContent onCloseAutoFocus={closeSheet}>
                    <SheetHeader>
                        <SheetTitle className="text-xl">{spending ? "Edit spending" : "Create spending"}</SheetTitle>
                    </SheetHeader>

                    <div className="px-4 flex flex-col gap-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <DatePicker field={field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input type={"text"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input type={"number"} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem value={category.id!} key={category.id!}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Note</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="About this purchase..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <SheetFooter>
                        <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                            {loading && <LucideLoader2 className="spin-in" />}
                            {spending ? "Save changes" : "Create"}
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

export default SpendingForm;