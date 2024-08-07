import React, { useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import { Checkbox } from "~/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { type TableProps } from "~/types/tableTypes";
import { useRouter } from "next/router";
import { cn } from "~/lib/utils";
import { Badge } from "../ui/badge";

function generateColumns<T extends { id: number }>(
  config: TableProps<T>["tableConfig"]
) {
  const columns: ColumnDef<T>[] = [];

  if (config.checkbox) {
    columns.push({
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false
    });
  }

  config.columns.forEach((col) => {
    columns.push({
      accessorKey: col.accessorKey,
      header: ({ column }) =>
        col.sortable ? (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {col.header}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          col.header
        ),
      cell: ({ row }) => {
        if (col.cell) {
          return col.cell(row);
        }
        if (col.isBadge) {
          return (
            <Badge
              className={` ${row.getValue(col.accessorKey) === "ACTIVE" ? "bg-green-500" : ""} ${row.getValue(col.accessorKey) === "INACTIVE" ? "bg-gray-500" : ""} ${row.getValue(col.accessorKey) === "ONBOARDING" ? "bg-yellow-500" : ""} `}
            >
              {row.getValue(col.accessorKey)}
            </Badge>
          );
        }
        const cellValue: string = row.getValue(col.accessorKey);
        return <div>{cellValue}</div>;
      }
    });
  });

  return columns;
}

export function TableComponent<T extends { id: number }>({
  tableConfig,
  data
}: TableProps<T>) {
  const columns = generateColumns(tableConfig);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const router = useRouter();

  const table = useReactTable({
    data: data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    },
    initialState: {
      pagination: {
        pageSize: tableConfig.maxRowsBeforePagination ?? 10
      }
    }
  });

  const firstFilterableColumn = table
    .getAllColumns()
    .find((column) => column.getCanFilter());

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center py-4">
        {firstFilterableColumn && (
          <Input
            placeholder={tableConfig.placeholder}
            value={(firstFilterableColumn.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              firstFilterableColumn.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-grow overflow-auto rounded-md border">
        <UITable>
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
                  );
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
                    <TableCell
                      key={cell.id}
                      className={cn(tableConfig.link && "cursor-pointer")}
                      onClick={async () => {
                        if (tableConfig.link) {
                          await router.push(
                            `${tableConfig.link}/${row.original.id}`
                          );
                        }
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UITable>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
