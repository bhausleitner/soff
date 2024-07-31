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
          `Supplier grade: A`,
          `Response Time: ${supplier.responseTime ?? "N/A"}h`
        ]}
      />
      <InfoCard
        title="Communication"
        lines={[
          `Email: ${supplier.email}`,
          "Phone: 123-456-7890",
          "Address: 123 Main St"
        ]}
      />
      <InfoCard
        title="Documents"
        lines={["NDA", "Terms & Conditions", "Billing history", "Certificates"]}
      />
    </div>
  );
}
