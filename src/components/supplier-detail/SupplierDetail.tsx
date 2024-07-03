import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function SupplierDetail() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center ">
          <CardTitle className="text-sm font-medium">
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Testing this
          </p>
        </CardContent>
      </Card>
    </>
    
  );
}