import React from "react";
import { TableComponent } from "~/components/common/TableComponent";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";

const tableConfig = {
  placeholder: "Filter part...",
  checkbox: true,
  columns: [
    { header: "Part Name", accessorKey: "partName", sortable: true },
    { header: "Description", accessorKey: "description", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true }
  ]
};

export function SupplierPartTable() {
  const { data, isLoading } = api.part.partsBySupplier.useQuery();

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
