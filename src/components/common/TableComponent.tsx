import React, { useEffect, useState } from "react";
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
  useReactTable,
  getExpandedRowModel
} from "@tanstack/react-table";
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
import { type Status, type QuoteStatus, type RfqStatus } from "@prisma/client";
import { formatDate } from "~/utils/time";
import { Icons } from "~/components/icons";

export const statusClassMap: Record<QuoteStatus | Status | RfqStatus, string> =
  {
    ACTIVE: "bg-green-500",
    INACTIVE: "bg-gray-500",
    ONBOARDING: "bg-yellow-500",
    REQUESTED: "bg-yellow-500",
    WAITING: "bg-yellow-500",
    RECEIVED: "bg-teal-400",
    CONFIRMED: "bg-green-500",
    REJECTED: "bg-red-500",
    REVIEW: "bg-gray-500",
    CLOSED: "bg-gray-500",
    AWARDED: "bg-green-500"
  };

function generateColumns<T extends { id: number }>(
  config: TableProps<T>["tableConfig"]
) {
  const columns: ColumnDef<T>[] = [];

  if (config.expandable) {
    columns.push({
      id: "expander",
      header: ({}) => null,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => row.toggleExpanded()}
        >
          <Icons.chevronRight
            className={`h-4 w-4 transition-transform ${
              row.getIsExpanded() ? "rotate-90" : ""
            }`}
          />
        </Button>
      )
    });
  }

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
          className="checked:bg-blue"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="checked:bg-blue-500"
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
        const accessorKey: string = row.getValue(col.accessorKey);
        if (col.cell) {
          return col.cell(row);
        }
        if (col.isBadge) {
          return (
            <Badge
              className={cn(
                statusClassMap[accessorKey as keyof typeof statusClassMap]
              )}
            >
              {row.getValue(col.accessorKey)}
            </Badge>
          );
        }
        if (col.isDate) {
          const cellValue: string = row.getValue(col.accessorKey);
          return <div>{formatDate(cellValue)}</div>;
        }
        const cellValue: string = row.getValue(col.accessorKey);
        return <div>{cellValue}</div>;
      },
      filterFn: col.filterFn
    });
  });

  return columns;
}

export function TableComponent<T extends { id: number }>({
  tableConfig,
  data,
  onSelectedRowIdsChange
}: TableProps<T>) {
  const columns = generateColumns(tableConfig);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState({});
  const router = useRouter();

  const handleRowClick = async (row: any, cellId: string) => {
    if (
      tableConfig.link &&
      cellId !== "select" &&
      cellId !== "expander" &&
      !cellId.includes("actions") // Assuming action cells have 'actions' in their id
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      await router.push(`${tableConfig.link}/${row?.original?.id}`);
    }
  };

  // if the parent component wants to access the selected row ids -> pass it up
  useEffect(() => {
    if (onSelectedRowIdsChange) {
      onSelectedRowIdsChange(
        table.getSelectedRowModel().rows.map((row) => row.original.id)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  const table = useReactTable({
    data: data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded
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

  console.log(firstFilterableColumn);

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
              Columns <Icons.chevronDown className="ml-2 h-4 w-4" />
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
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          tableConfig.link &&
                            cell.column.id !== "select" &&
                            cell.column.id !== "expander" &&
                            !cell.column.id.includes("actions") &&
                            "cursor-pointer"
                        )}
                        onClick={async (
                          e: React.MouseEvent<HTMLTableCellElement>
                        ) => {
                          const target = e.target as Element;
                          if (
                            !target.closest("button") &&
                            !target.closest('[role="menu"]')
                          ) {
                            await handleRowClick(row, cell.column.id);
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
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={columns.length}>
                        {tableConfig.renderSubComponent?.(row)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
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
