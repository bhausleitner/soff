import React, { useEffect, useState } from "react";
import { TableComponent } from "~/components/common/TableComponent";
import { api } from "~/utils/api";
import { type Supplier } from "~/server/api/routers/supplier";
import { SupplierAction } from "./SupplierAction";
import { SupplierLink } from "./SupplierLink";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { ArrowUpDown } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import Spinner from "~/components/spinner";

const columns: ColumnDef<Supplier>[] = [
  {
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
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <SupplierLink row={row} />
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <div>{row.getValue("status")}</div>
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <SupplierAction row={row} />
  }
];

const useFetchSuppliers = () => {
  const { data, isLoading } = api.supplier.getAllSuppliers.useQuery();
  const [tableData, setTableData] = useState<Supplier[]>([]);

  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  return { tableData, isLoading };
};

export function SupplierTable() {
  const { tableData, isLoading } = useFetchSuppliers();

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <TableComponent
          columns={columns}
          dataFetcher={() => Promise.resolve(tableData)}
          filterPlaceholder="Filter supplier..."
        />
      )}
    </>
  );
}
