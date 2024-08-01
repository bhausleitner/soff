import React from "react";
import { InfoCard } from "~/components/common/InfoCard";
import { type Quote } from "~/server/api/routers/quote";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface QuoteInfoProps {
  quote: Quote;
  supplierName: string;
  supplierContactPerson: string;
  supplierEmail: string;
}

export function QuoteInfo({
  quote,
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
            ${quote.price ? quote.price : "$-"}
          </div>
          {quote.paymentTerms && (
            <p className="text-xs text-muted-foreground">
              Payment terms: {quote.paymentTerms}
            </p>
          )}
        </CardContent>
      </Card>
      <InfoCard
        title="Quote Details"
        lines={[
          //display date as tay and time without gmt and timezone
          `Received: ${new Date(quote.createdAt).toLocaleString()}`,
          `Status: ${quote.status}`,
          // if no payment terms display '-'
          `Payment terms: ${quote.paymentTerms ? quote.paymentTerms : "-"}`
        ]}
      />
      <InfoCard
        title="Supplier Information"
        lines={[
          `Supplier: ${supplierName}`,
          `Contact: ${supplierContactPerson}`,
          `Email: ${supplierEmail}`
        ]}
      />
    </div>
  );
}
