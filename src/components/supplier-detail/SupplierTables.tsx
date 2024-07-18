import React from "react";
import { api } from "~/utils/api";
import { GenericTable } from "~/components/common/GenericTable";

const supplierOrderTableConfig = {
  placeholder: "Filter orders...",
  checkbox: true,
  columns: [
    { header: "Order ID", accessorKey: "id", sortable: true },
    { header: "Quote ID", accessorKey: "quoteId", sortable: true },
    {
      header: "Delivery Address",
      accessorKey: "deliveryAddress",
      sortable: true
    },
    { header: "Status", accessorKey: "status", sortable: true }
  ]
};

const supplierPartTableConfig = {
  placeholder: "Filter part...",
  checkbox: true,
  columns: [
    { header: "Part Number", accessorKey: "partNumber", sortable: true },
    { header: "Part Name", accessorKey: "partName", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true },
    { header: "CAD File", accessorKey: "cadFile", sortable: false }
  ]
};

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

interface SupplierProps {
  supplierId: number;
}

export function SupplierOrderTable({ supplierId }: SupplierProps) {
  return (
    <GenericTable
      supplierId={supplierId}
      tableConfig={supplierOrderTableConfig}
      endpoint={api.supplier.getOrdersBySupplierId}
    />
  );
}

export function SupplierPartTable({ supplierId }: SupplierProps) {
  return (
    <GenericTable
      supplierId={supplierId}
      tableConfig={supplierPartTableConfig}
      endpoint={api.part.getPartsBySupplierId}
    />
  );
}

export function SupplierQuoteTable({ supplierId }: SupplierProps) {
  return (
    <GenericTable
      supplierId={supplierId}
      tableConfig={supplierQuoteTableConfig}
      endpoint={api.supplier.getQuotesBySupplierId}
    />
  );
}
