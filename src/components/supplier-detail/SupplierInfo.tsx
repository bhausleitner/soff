import React from "react";
import { InfoCard } from "~/components/common/InfoCard";
import { type Supplier } from "~/server/api/routers/supplier";

export function SupplierInfo(supplier: Supplier) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InfoCard
        title={supplier.name}
        lines={[
          `Status: ${supplier.status}`,
          `Supplier grade: coming soon`,
          `Response Time: ${supplier.responseTime ?? "N/A"}h`
        ]}
      />
      <InfoCard
        title="Communication"
        lines={[
          `Email: ${supplier.email}`,
          `Phone: ${supplier.phone}`,
          `Address: ${supplier.address}`
        ]}
      />
      <InfoCard
        title="Documents"
        lines={[
          "Non-Disclosure Agreements",
          "Terms & Conditions",
          "Billing history",
          "Certificates"
        ]}
      />
    </div>
  );
}
