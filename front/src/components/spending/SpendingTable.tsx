import {useContext} from "react";
import SpendingContext from "../../contexts/SpendingContext.tsx";
import {type ColumnDef, getCoreRowModel, getSortedRowModel, useReactTable} from "@tanstack/react-table";
import type {SpendingModel} from "../../models/SpendingModel.ts";
import type {CategoryModel} from "../../models/CategoryModel.ts";
import {Badge} from "../ui/badge.tsx";
import {Table, TableHeader, TableRow, TableHead, TableBody, TableCell} from "../ui/table.tsx";
import {flexRender} from "@tanstack/react-table";
import { Button } from "../ui/button.tsx";
import {ArrowUpDown, LucideEdit, LucideTrash2} from "lucide-react";
import FormSheetContext from "../../contexts/FormSheetContext.tsx";

const getColumns = (onEdit: (spending: SpendingModel) => void, onDelete: (spending: SpendingModel) => void): ColumnDef<SpendingModel>[] => [
    {
        accessorKey: "date",
        header: ({ column }) => {
            return (
                <Button variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Date
                    <ArrowUpDown />
                </Button>
            )
        },
        sortingFn: "datetime",
        enableSorting: true,
        sortDescFirst: true,
        cell: ({ row }) => {
            const date = new Date(row.getValue("date"));
            const formatted = Intl.DateTimeFormat("fr-FR").format(date);
            return <div className="font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "label",
        header: ({ column }) => {
            return (
                <Button variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Label
                    <ArrowUpDown />
                </Button>
            )
        },
        enableSorting: true,
        cell: ({ row }) => {
            const label = row.getValue("label") as string;
            return <div className="font-medium">{label}</div>
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <div className="text-right">
                    <Button variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Amount
                        <ArrowUpDown />
                    </Button>
                </div>
            )
        },
        enableSorting: true,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"))
            const formatted = new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
            }).format(amount)

            return <div className="text-right font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "category",
        header: () => <div className="text-center">Category</div>,
        cell: ({ row }) => {
            const category = row.getValue("category") as CategoryModel;

            return (
                <div className="flex justify-center items-center">
                    <Badge variant="outline" style={{border: `solid 1px ${category.color}`, color: category.color}}>
                        {category.name}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "description",
        header: () => <div>Note</div>,
        cell: ({ row }) => {
            return (
                <div>
                    {row.getValue("description")}
                </div>
            )
        },
    },
    {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
            const spending = row.original;

            return (
                <div className="flex justify-end gap-2">
                    <Button onClick={() => onEdit(spending)}>
                        <LucideEdit/>
                        Edit
                    </Button>
                    <Button variant="destructive"
                        onClick={() => onDelete(spending)}>
                        <LucideTrash2 />
                        Delete
                    </Button>
                </div>
            );
        },
    },
]

function SpendingTable() {
    const {spendings, loading ,remove} = useContext(SpendingContext)!;
    const {open: openSheet} = useContext(FormSheetContext)!;

    const onEdit = (spending: SpendingModel) => {
        openSheet(spending);
    }

    const columns = getColumns(onEdit, remove);

    const table = useReactTable({
        data: spendings,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel()
    });

    return (
        <Table>
            <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                            return (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            )
                        })}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                        >
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            {loading ?  "Loading..." : "No results."}
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

export default SpendingTable;