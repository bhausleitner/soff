import { api } from "~/utils/api";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import { type Row } from "@tanstack/react-table";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { type PricingTier } from "@prisma/client";
import { type QuoteLineItem } from "~/server/api/routers/quote";

export const quoteTableConfig = {
  link: "/quotes",
  maxRowsBeforePagination: 9,
  placeholder: "Filter quotes...",
  checkbox: true,
  columns: [
    {
      header: "Quote ID",
      accessorKey: "id",
      sortable: true
    },
    { header: "Status", accessorKey: "status", sortable: true, isBadge: true },
    { header: "Part ID", accessorKey: "partId", sortable: true },
    { header: "Quantity", accessorKey: "quantity", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true }
  ]
};

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
    {
      header: "Status",
      accessorKey: "status",
      sortable: true
    }
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
  ],
  expandable: true,
  renderSubComponent: (row: Row<QuoteLineItem>) => {
    return (
      <Table>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="w-1/4 py-2 text-center text-xs font-medium">
                    Min Quantity
                  </TableHead>
                  <TableHead className="w-1/4 py-2 text-center text-xs font-medium">
                    Max Quantity
                  </TableHead>
                  <TableHead className="w-1/4 py-2 text-center text-xs font-medium">
                    Price [USD]
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {row.original.pricingTiers.map(
                  (tier: PricingTier, index: number) => (
                    <TableRow key={index}>
                      <TableCell className="w-1/4 p-2 text-center">
                        {tier.minQuantity}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "w-1/4 p-2 text-center",
                          tier.maxQuantity === null && "text-xl"
                        )}
                      >
                        {tier.maxQuantity ?? "∞"}
                      </TableCell>
                      <TableCell className="w-1/4 p-2 text-center">
                        {tier.price}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Table>
    );
  }
};

export const supplierTableConfig = {
  placeholder: "Filter supplier...",
  maxRowsBeforePagination: 9,
  link: "/suppliers",
  checkbox: true,
  columns: [
    {
      header: "Name",
      accessorKey: "name",
      sortable: true
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: false,
      isBadge: true
    },
    { header: "Email", accessorKey: "email", sortable: true }
  ]
};

export const rfqTableConfig = {
  placeholder: "Filter RFQs...",
  maxRowsBeforePagination: 9,
  link: "/rfqs",
  checkbox: true,
  columns: [
    { header: "RFQ ID", accessorKey: "id", sortable: true },
    { header: "Status", accessorKey: "status", sortable: true, isBadge: true },
    {
      header: "Requested At",
      accessorKey: "createdAt",
      sortable: true,
      isDate: true
    }
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

export const useGetAllRequestsForQuotes = (args: { clerkUserId: string }) =>
  api.rfq.getAllRequestsForQuotes.useQuery(args);
