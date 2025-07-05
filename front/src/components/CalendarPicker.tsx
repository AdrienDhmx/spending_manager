import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import {Label} from "./ui/label.tsx";
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover.tsx";
import { Button } from "./ui/button.tsx";
import {Calendar} from "./ui/calendar.tsx";

export interface CalendarPickerProps {
    date: Date,
    setDate: (date: Date) => void,
    label?: string,
}

function CalendarPicker({date, setDate, label}: CalendarPickerProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <div className="flex flex-col gap-3">
            {label && (
                <Label htmlFor="date" className="px-1">
                    {label}
                </Label>
            )}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        id="date"
                        className="w-48 justify-between font-normal"
                    >
                        {date ? date.toLocaleDateString() : "Select date"}
                        <ChevronDownIcon />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            setDate(date)
                            setOpen(false)
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default CalendarPicker;