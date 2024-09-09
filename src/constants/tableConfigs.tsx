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
import { type Quote, type QuoteLineItem } from "~/server/api/routers/quote";
import SupplierLocalTime from "~/components/supplier/supplier-local-time";
import { type SupplierLineItem } from "~/server/api/routers/supplier";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import { openErpQuoteUrl } from "~/hooks/erpHelper";
import { SupplierBadge } from "~/components/supplier/supplier-badge";
import { SupplierCell } from "~/components/supplier/supplier-cell";
import { type RequestForQuoteLineItem } from "~/server/api/routers/rfq";

export const quoteTableConfig = {
  maxRowsBeforePagination: 7,
  placeholder: "Filter quotes...",
  checkbox: true,
  link: "/quotes",
  columns: [
    {
      header: "ID",
      accessorKey: "id",
      sortable: false,
      cell: (row: Row<Quote>) => {
        return (
          <div className="max-w-20">
            <p>Q{row.original.id}</p>
          </div>
        );
      },
      filterFn: (row: Row<Quote>, columnId: string, filterValue: string) => {
        return `Q${row.original.id}${row.original.supplier.name}${row.original.supplier.email}`
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
    },
    {
      header: "Supplier",
      accessorKey: "supplier",
      sortable: false,
      cell: (row: Row<Quote>) => {
        return (
          <div>
            <p className="font-bold">{row.original.supplier.name}</p>
            <p className="text-sm text-gray-500">
              {row.original.supplier.email}
            </p>
          </div>
        );
      }
    },

    {
      header: "Price",
      accessorKey: "price",
      sortable: true,
      cell: (row: Row<Quote>) => {
        return <div className="">${row.original.price.toFixed(2)}</div>;
      }
    },
    { header: "Status", accessorKey: "status", sortable: true, isBadge: true },
    {
      header: "Received At",
      accessorKey: "createdAt",
      sortable: true,
      isDate: true
    },
    {
      header: "Actions",
      accessorKey: "actions",
      sortable: false,

      cell: (row: Row<Quote>) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <Icons.ellipsis className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={!row.original.chatId}
                className={cn(
                  row.original.chatId ? "cursor-pointer" : "cursor-not-allowed"
                )}
                onClick={async () => {
                  window.open(`/chat/${row.original.chatId}`, "_self");
                }}
              >
                <Icons.messageCircleMore className="mr-2 h-4 w-4" />
                View Chat
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!row.original.supplier.organization?.erpQuoteUrl}
                className="cursor-pointer"
                onClick={() =>
                  openErpQuoteUrl(
                    row.original.supplier.organization?.erpQuoteUrl ?? "",
                    row.original.id
                  )
                }
              >
                <Icons.odooLogo className="mr-2 h-4 w-4" />
                View in Odoo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      }
    }
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
    { header: "Part ID", accessorKey: "partIdString", sortable: true },
    { header: "Description", accessorKey: "description", sortable: true },
    { header: "Quantity", accessorKey: "quantity", sortable: true },
    { header: "Price", accessorKey: "price", sortable: true }
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
  maxRowsBeforePagination: 7,
  link: "/suppliers",
  checkbox: true,
  columns: [
    {
      header: "Contact",
      accessorKey: "contact",
      sortable: true,
      cell: (row: Row<SupplierLineItem>) => {
        return <SupplierCell supplier={row.original} />;
      },
      filterFn: (
        row: Row<SupplierLineItem>,
        columnId: string,
        filterValue: string
      ) => {
        return `${row.original.name}${row.original.email}`
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: false,
      isBadge: true
    },
    {
      header: "Local Time",
      accessorKey: "localTime",
      sortable: false,
      cell: (row: Row<SupplierLineItem>) => {
        return <SupplierLocalTime utcOffset={row.original.utcOffset ?? 0} />;
      }
    }
  ]
};

export const rfqTableConfig = {
  placeholder: "Filter RFQs...",
  maxRowsBeforePagination: 9,
  link: "/rfqs",
  checkbox: true,
  columns: [
    {
      header: "ID",
      accessorKey: "id",
      sortable: false,
      cell: (row: Row<RequestForQuoteLineItem>) => {
        return <p>RFQ{row.original.id}</p>;
      },
      filterFn: (
        row: Row<RequestForQuoteLineItem>,
        columnId: string,
        filterValue: string
      ) => {
        return `RFQ${row.original.id}${row.original.subject}${row.original.suppliers
          .map((supplier) => supplier.name)
          .join("")}`
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
    },
    {
      header: "Subject",
      accessorKey: "subject",
      sortable: true,
      cell: (row: Row<RequestForQuoteLineItem>) => {
        return <p>{row.original.subject ?? "No subject"}</p>;
      }
    },
    { header: "Status", accessorKey: "status", sortable: true, isBadge: true },
    {
      header: "Requested At",
      accessorKey: "createdAt",
      sortable: true,
      isDate: true
    },
    {
      header: "Suppliers",
      accessorKey: "suppliers",
      sortable: false,
      cell: (row: Row<RequestForQuoteLineItem>) => {
        return (
          <div className="flex flex-row gap-2">
            {row.original.suppliers.map((supplier) => (
              <SupplierBadge key={supplier.id} supplier={supplier} />
            ))}
          </div>
        );
      }
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
