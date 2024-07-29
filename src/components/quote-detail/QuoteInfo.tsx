import React from "react";
import { InfoCard } from "~/components/common/InfoCard";
import { type Quote } from "~/server/api/routers/quote";
import { type Supplier } from "~/server/api/routers/supplier";

interface QuoteInfoProps {
  quote: Quote;
  supplier: Supplier;
}

export function QuoteInfo({ quote, supplier }: QuoteInfoProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InfoCard
        title="Quote Details"
        lines={[
          `Price: ${quote.price ? quote.price : "$-"}`,
          `Quantity: ${quote.supplierId}`,
          `Status: ${quote.status}`
        ]}
      />
      <InfoCard
        title="Supplier Information"
        lines={[
          `Supplier: ${supplier.name}`,
          `Contact: ${supplier.contactPerson}`,
          `Email: ${supplier.email}`
        ]}
      />
      <InfoCard
        title="Additional Information"
        lines={[
          `Price: ${quote.price ? quote.price : "$-"}`,
          `Quantity:`,
          `Status: ${quote.status}`
        ]}
      />
    </div>
  );
}
