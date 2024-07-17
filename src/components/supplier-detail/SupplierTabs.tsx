import React from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "~/components/ui/tabs";
import { SupplierPartTable } from "./SupplierPartTable";
import { SupplierQuoteTable } from "./SupplierQuoteTable";
import { SupplierOrderTable } from "./SupplierOrderTable";

interface SupplierTabsProps {
  supplierId: number;
}

export function SupplierTabs({ supplierId }: SupplierTabsProps) {
  return (
    <>
      <Tabs defaultValue="parts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        <TabsContent value="parts" className="space-y-4">
          <SupplierPartTable supplierId={supplierId} />
        </TabsContent>
        <TabsContent value="quotes" className="space-y-4">
          <SupplierQuoteTable supplierId={supplierId} />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <SupplierOrderTable supplierId={supplierId} />
        </TabsContent>
      </Tabs>
    </>
  );
}
