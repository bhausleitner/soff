import React from "react";
import { TableComponent } from "~/components/common/TableComponent";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";

interface SupplierProps {
  supplierId: number;
}

const supplierOrderTableConfig = {
  placeholder: "Filter orders...",
  checkbox: true,
  columns: [
    { header: "Order ID", accessorKey: "id", sortable: true },
    { header: "Quote ID", accessorKey: "quoteId", sortable: true },
    // { header: "Order Date", accessorKey: "orderDate", sortable: true },
    // { header: "Delivery Date", accessorKey: "deliveryDate", sortable: true },
    {
      header: "Delivery Address",
      accessorKey: "deliveryAddress",
      sortable: true
    },
    { header: "Status", accessorKey: "status", sortable: true }
  ]
};

export function SupplierOrderTable({ supplierId }: SupplierProps) {
  const { data, isLoading } = api.supplier.getOrdersBySupplierId.useQuery({
    supplierId
  });

  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <TableComponent
          tableConfig={supplierOrderTableConfig}
          data={data ?? []}
        />
      )}
    </>
  );
}
