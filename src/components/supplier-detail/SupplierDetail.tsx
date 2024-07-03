import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/utils/api";

interface SupplierDetailProps {
  supplierId: number;
}

export function SupplierDetail({ supplierId }: SupplierDetailProps) {
  // const { data, isLoading, error } = api.supplier.getSupplierById.useQuery({ supplierId});

  const data = {
    title: "Supplier Name",
    email: "supplier.emial",
    status: "Active",
    response_time: 5
  };

  //  if (isLoading) {
  //   return <p>Loading...</p>;
  // }

  // if (error) {
  //   return <p>Error: {error.message}</p>;
  // }

  // if (!data) {
  //   return <p>No supplier found.</p>;
  // }

  return (
    <>
      <div className="flex flex-row flex-wrap">
        <div className="mb-4 mr-4 min-w-[320px] flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="text-sm font-medium">
                {data.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Email: {data.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Status: {data.status}
              </p>
              <p className="text-xs text-muted-foreground">
                Response Time: {data.response_time ?? "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mb-4 mr-4 min-w-[320px] flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="text-sm font-medium">
                {data.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Email: {data.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Status: {data.status}
              </p>
              <p className="text-xs text-muted-foreground">
                Response Time: {data.response_time ?? "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mb-4 min-w-[320px] max-w-[360px] flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <CardTitle className="text-sm font-medium">
                {data.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Email: {data.email}
              </p>
              <p className="text-xs text-muted-foreground">
                Status: {data.status}
              </p>
              <p className="text-xs text-muted-foreground">
                Response Time: {data.response_time ?? "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
