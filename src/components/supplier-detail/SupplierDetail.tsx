import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/utils/api";

interface SupplierDetailProps {
  supplierId: number;
}

export function SupplierDetail({ supplierId }: SupplierDetailProps) {
  // const { data, isLoading, error } = api.supplier.getSupplierById.useQuery({ supplierId});

  const data = {
    title: "Supplier 1",
    email: "supplier.email",
    status: "Active",
    response_time: 5
  };

  // if (isLoading) {
  //   return <p>Loading...</p>;
  // }

  // if (error) {
  //   return <p>Error: {error.message}</p>;
  // }

  // if (!data) {
  //   return <p>No supplier found.</p>;
  // }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-xs text-muted-foreground">Email: {data.email}</p>
            <p className="text-xs text-muted-foreground">
              Status: {data.status}
            </p>
            <p className="text-xs text-muted-foreground">
              Response Time: {data.response_time ?? "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-sm font-medium">
              Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow"></CardContent>
        </Card>
      </div>
      <div className="flex flex-col">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-sm font-medium"></CardTitle>
          </CardHeader>
          <CardContent className="flex-grow"></CardContent>
        </Card>
      </div>
    </div>
  );
}
