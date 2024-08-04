import { api } from "~/utils/api";

export const supplierOrderTableConfig = {
  placeholder: "Filter orders...",
  maxRowsBeforePagination: 6,
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
  maxRowsBeforePagination: 6,
  checkbox: true,
  columns: [
    { header: "Part Number", accessorKey: "partNumber", sortable: true },
    { header: "Part Name", accessorKey: "partName", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true },
    { header: "CAD File", accessorKey: "cadFile", sortable: false }
  ]
};

export const supplierQuoteTableConfig = {
  link: "/quotes",
  maxRowsBeforePagination: 6,
  placeholder: "Filter quotes...",
  checkbox: true,
  columns: [
    { header: "Quote ID", accessorKey: "id", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true },
    { header: "Status", accessorKey: "status", sortable: true }
  ]
};

export const quoteTableConfig = {
  link: "/quotes",
  maxRowsBeforePagination: 10,
  placeholder: "Filter quotes...",
  checkbox: true,
  columns: [
    {
      header: "Quote ID",
      accessorKey: "id",
      sortable: true
    },
    { header: "Part ID", accessorKey: "partId", sortable: true },
    { header: "Quantity", accessorKey: "quantity", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true },
    { header: "Status", accessorKey: "status", sortable: true }
  ]
};

export const quoteLineItemTableConfig = {
  placeholder: "Filter line items...",
  maxRowsBeforePagination: 6,
  checkbox: true,
  columns: [
    { header: "Part ID", accessorKey: "partId", sortable: true },
    { header: "Description", accessorKey: "description", sortable: true },
    { header: "Quantity", accessorKey: "quantity", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true },
    { header: "Lead Time", accessorKey: "leadTime", sortable: true }
  ]
};

export const supplierTableConfig = {
  placeholder: "Filter supplier...",
  maxRowsBeforePagination: 10,
  link: "/suppliers",
  checkbox: true,
  columns: [
    {
      header: "Name",
      accessorKey: "name",
      sortable: true
    },
    { header: "Status", accessorKey: "status", sortable: false },
    { header: "Email", accessorKey: "email", sortable: true }
  ]
};

export const useGetPartsBySupplierQuery = (args: { supplierId: number }) =>
  api.part.getPartsBySupplierId.useQuery(args);
export const useGetQuotesBySupplierQuery = (args: { supplierId: number }) =>
  api.supplier.getQuotesBySupplierId.useQuery(args);
export const useGetOrdersBySupplierQuery = (args: { supplierId: number }) =>
  api.supplier.getOrdersBySupplierId.useQuery(args);

export const useGetOrdersByQuoteQuery = (args: { quoteId: number }) =>
  api.quote.getOrdersByQuoteId.useQuery(args);

export const useGetAllQuotes = (args: { clerkUserId: string }) =>
  api.quote.getAllQuotes.useQuery(args);
export const useGetAllSuppliers = (args: { clerkUserId: string }) =>
  api.supplier.getAllSuppliers.useQuery(args);

export const useGetLineItemsByQuoteQuery = (args: { quoteId: number }) =>
  api.quote.getLineItemsByQuoteId.useQuery(args);
