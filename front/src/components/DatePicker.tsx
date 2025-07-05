import { CalendarIcon } from "lucide-react"
import { FormControl } from "./ui/form"
import {format} from "date-fns";
import {cn} from "../lib/utils.ts";
import {Calendar} from "./ui/calendar.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover.tsx";
import { Button } from "./ui/button.tsx";
import type { ControllerRenderProps } from "react-hook-form";

export interface DatePickerProps {
    field: ControllerRenderProps<any, string>,
}

export function DatePicker({ field }: DatePickerProps) {

    return (
        <Popover>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                        )}
                    >
                        {field.value ? (
                            format(field.value, "PPP")
                        ) : (
                            <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date: Date) =>
                        date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    )
}
