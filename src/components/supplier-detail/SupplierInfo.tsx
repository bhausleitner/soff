import React from "react";
import { InfoCard } from "~/components/common/InfoCard";
import { type Supplier } from "@prisma/client";
import { Badge } from "~/components/ui/badge";

export function SupplierInfo(supplier: Supplier) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InfoCard
        title={supplier.name}
        lines={[
          `Status: ${supplier.status}`,
          `Supplier Grade:`,
          `Response Time:`
        ]}
      />
      <InfoCard
        title="Contact Details"
        lines={[
          `${supplier.contactPerson}`,
          `Email: ${supplier.email}`,
          `Phone: ${supplier.phone}`,
          `Street: ${supplier.street}`
        ]}
      />
      <InfoCard
        title="Documents"
        lines={[
          "Non-Disclosure Agreements",
          "Terms & Conditions",
          "Billing History",
          "Certificates"
        ]}
        badge={<Badge variant="secondary">Coming Soon</Badge>}
      />
    </div>
  );
}
