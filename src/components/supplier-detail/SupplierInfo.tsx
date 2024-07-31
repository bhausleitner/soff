import React from "react";
import { InfoCard } from "~/components/common/InfoCard";

interface SupplierInfoProps {
  data: {
    name: string;
    email: string;
    status: string;
    responseTime?: number | null;
  };
}

export function SupplierInfo({ data }: SupplierInfoProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InfoCard
        title={data.name}
        lines={[
          `Status: ${data.status}`,
          `Supplier grade: A`,
          `Response Time: ${data.responseTime ?? "N/A"}h`
        ]}
      />
      <InfoCard
        title="Communication"
        lines={[
          `Email: ${data.email}`,
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
