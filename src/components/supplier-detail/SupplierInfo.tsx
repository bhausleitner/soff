import React from "react";
import { SupplierInfoCard } from "./SupplierInfoCard";

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
      <SupplierInfoCard
        title={data.name}
        lines={[
          `Status: ${data.status}`,
          `Supplier grade: A`,
          `Response Time: ${data.responseTime ?? "N/A"}h`
        ]}
      />
      <SupplierInfoCard
        title="Communication"
        lines={[
          `Email: ${data.email}`,
          "Phone: 123-456-7890",
          "Address: 123 Main St",
          "Communication history"
        ]}
      />
      <SupplierInfoCard
        title="Documents"
        lines={["NDA", "Terms & Conditions", "Billing history", "Certificates"]}
      />
    </div>
  );
}
