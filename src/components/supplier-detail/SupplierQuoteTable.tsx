import React from "react";
import { TableComponent } from "~/components/common/TableComponent";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";

interface SupplierProps {
  supplierId: number;
}

const supplierQuoteTableConfig = {
  placeholder: "Filter quotes...",
  checkbox: true,
  columns: [
    { header: "Quote ID", accessorKey: "id", sortable: true },
    { header: "Part ID", accessorKey: "partId", sortable: true },
    { header: "Quantity", accessorKey: "quantity", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true },
    { header: "Status", accessorKey: "status", sortable: true }
  ]
};

export function SupplierQuoteTable({ supplierId }: SupplierProps) {
  const { data, isLoading } = api.supplier.getQuotesBySupplierId.useQuery({
    supplierId
  });

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <TableComponent
          tableConfig={supplierQuoteTableConfig}
          data={data ?? []}
        />
      )}
    </>
  );
}
