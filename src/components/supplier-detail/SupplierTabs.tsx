import React from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "~/components/ui/tabs";
import { SupplierParts } from "./SupplierParts";

export function SupplierTabs() {
  return (
    <>
      <Tabs defaultValue="parts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        <TabsContent value="parts" className="space-y-4">
          <SupplierParts></SupplierParts>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          Orders
        </TabsContent>
        <TabsContent value="quotes" className="space-y-4">
          Quotes
        </TabsContent>
      </Tabs>
    </>
  );
}
