import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface SupplierInfoProps {
  data: {
    title: string;
    email: string;
    status: string;
    response_time?: number;
  };
}

export function SupplierInfo({ data }: SupplierInfoProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-xs text-muted-foreground">
              Status: {data.status}
            </p>
            <p className="text-xs text-muted-foreground">Supplier grade: A</p>
            <p className="text-xs text-muted-foreground">
              Response Time: {data.response_time ?? "N/A"}h
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-sm font-medium">Communication</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-xs text-muted-foreground">Email: {data.email}</p>
            <p className="text-xs text-muted-foreground">Phone: 123-456-7890</p>
            <p className="text-xs text-muted-foreground">
              Address: 123 Main St
            </p>
            <p className="text-xs text-muted-foreground">
              Communication history
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col">
        <Card className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-xs text-muted-foreground">NDA</p>
            <p className="text-xs text-muted-foreground">Terms & Conditions</p>
            <p className="text-xs text-muted-foreground">Billing history</p>
            <p className="text-xs text-muted-foreground">Certificates</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
