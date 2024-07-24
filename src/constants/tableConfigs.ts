import { api } from "~/utils/api";

export const supplierOrderTableConfig = {
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

export const supplierPartTableConfig = {
  placeholder: "Filter part...",
  checkbox: true,
  columns: [
    { header: "Part Number", accessorKey: "partNumber", sortable: true },
    { header: "Part Name", accessorKey: "partName", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true },
    { header: "CAD File", accessorKey: "cadFile", sortable: false }
  ]
};

export const supplierQuoteTableConfig = {
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

export const quoteTableConfig = {
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

export const useGetPartsBySupplierQuery = (args: { supplierId: number }) =>
  api.part.getPartsBySupplierId.useQuery(args);
export const useGetQuotesBySupplierQuery = (args: { supplierId: number }) =>
  api.supplier.getQuotesBySupplierId.useQuery(args);
export const useGetOrdersBySupplierQuery = (args: { supplierId: number }) =>
  api.supplier.getOrdersBySupplierId.useQuery(args);

export const useGetAllQuotes = () => api.quote.getAllQuotes.useQuery();
