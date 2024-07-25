import React from "react";
import { InfoCard } from "~/components/common/InfoCard";
import { type Quote } from "~/server/api/routers/quote";

interface QuoteInfoProps {
  quote: Quote;
}

export function QuoteInfo({ quote }: QuoteInfoProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InfoCard
        title="Quote Details"
        lines={[
          `Price: ${quote.price ? quote.price : "$-"}`,
          `Quantity: ${quote.quantity}`,
          `Status: ${quote.status}`
        ]}
      />
      <InfoCard
        title="Supplier Information"
        lines={[
          `Price: ${quote.price ? quote.price : "$-"}`,
          `Quantity: ${quote.quantity}`,
          `Status: ${quote.status}`
        ]}
      />
      <InfoCard
        title="Additional Information"
        lines={[
          `Price: ${quote.price ? quote.price : "$-"}`,
          `Quantity: ${quote.quantity}`,
          `Status: ${quote.status}`
        ]}
      />
    </div>
  );
}
