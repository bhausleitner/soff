import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/utils/api";

interface SupplierDetailProps {
  supplierId: number;
}

export function SupplierDetail({supplierId}: SupplierDetailProps) {
  const { data, isLoading, error } = api.supplier.getSupplierById.useQuery({ supplierId});

   if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>No supplier found.</p>;
  }


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center ">
          <CardTitle className="text-sm font-medium">
            Supplier
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">Name: {data.title}</p>
          <p className="text-xs text-muted-foreground">Email: {data.email}</p>
          <p className="text-xs text-muted-foreground">Status: {data.status}</p>
          <p className="text-xs text-muted-foreground">Response Time: {data.response_time ?? "N/A"}</p>
        </CardContent>
      </Card>
    </>
    
  );
}