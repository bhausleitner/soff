import React, { useEffect, useState } from "react";
import { TableComponent } from "~/components/common/TableComponent";
import { api } from "~/utils/api";
import { type Part } from "~/server/api/routers/part";
import { Checkbox } from "~/components/ui/checkbox";
import { type ColumnDef } from "@tanstack/react-table";
import Spinner from "~/components/spinner";

const columns: ColumnDef<Part>[] = [
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
    accessorKey: "partName",
    header: "Part Name",
    cell: ({ row }) => <div>{row.getValue("partName")}</div>
  }
];

export function SupplierPartTable() {
  const { data, isLoading } = api.part.partsBySupplier.useQuery();

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <TableComponent
          columns={columns}
          data={data ?? []}
          filterPlaceholder="Filter part..."
        />
      )}
    </>
  );
}
