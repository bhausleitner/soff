import React from "react";
import { TableComponent } from "~/components/common/TableComponent";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import { SupplierAction } from "~/components/supplier-table/SupplierAction";
import { type z } from "zod";
import { type supplierSchema } from "~/server/api/routers/supplier";

type SupplierType = z.infer<typeof supplierSchema>;

const tableConfig = {
  placeholder: "Filter supplier...",
  checkbox: true,
  columns: [
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
      link: "/suppliers/"
    },
    { header: "Status", accessorKey: "status", sortable: false },
    { header: "Email", accessorKey: "email", sortable: true },
    {
      header: "Actions",
      accessorKey: "actions",
      sortable: false,
      cell: (row: { original: SupplierType }) => <SupplierAction row={row} />
    }
  ]
};

export function SupplierTable() {
  const { data, isLoading } = api.supplier.getAllSuppliers.useQuery();

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <TableComponent tableConfig={tableConfig} data={data ?? []} />
      )}
    </>
  );
}
