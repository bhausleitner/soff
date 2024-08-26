import React from "react";
import { InfoCard } from "~/components/common/InfoCard";
import { type Quote } from "~/server/api/routers/quote";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface QuoteInfoProps {
  quotePrice?: number;
  quotePaymentTerms: string;
  quoteCreatedAt: Date;
  quoteStatus?: string;
  supplierName?: string;
  supplierContactPerson?: string;
  supplierEmail?: string;
}

export function QuoteInfo({
  quotePrice,
  quotePaymentTerms,
  quoteCreatedAt,
  quoteStatus,
  supplierName,
  supplierContactPerson,
  supplierEmail
}: QuoteInfoProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${quotePrice ? quotePrice : "$-"}
          </div>
          {quotePaymentTerms && (
            <p className="text-xs text-muted-foreground">
              Payment terms: {quotePaymentTerms}
            </p>
          )}
        </CardContent>
      </Card>
      <InfoCard
        title="Quote Details"
        lines={[
          //display date as tay and time without gmt and timezone
          `Received: ${new Date(quoteCreatedAt).toLocaleString()}`,
          `Status: ${quoteStatus}`,
          // if no payment terms display '-'
          `Payment terms: ${quotePaymentTerms ? quotePaymentTerms : "-"}`
        ]}
      />
      {supplierName && (
        <InfoCard
          title="Supplier Information"
          lines={[
            `Supplier: ${supplierName}`,
            `Contact: ${supplierContactPerson}`,
            `Email: ${supplierEmail}`
          ]}
        />
      )}
    </div>
  );
}
