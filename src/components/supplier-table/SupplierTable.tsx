import React from "react";
import { TableComponent } from "~/components/common/TableComponent";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";

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
    { header: "Actions", accessorKey: "actions", sortable: false }
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
