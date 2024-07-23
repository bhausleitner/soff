import React from "react";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "~/components/ui/tabs";
import { GenericTable } from "~/components/common/GenericTable";
import { api } from "~/utils/api";
import {
  supplierOrderTableConfig,
  supplierPartTableConfig,
  supplierQuoteTableConfig
} from "../../constants/tableConfigs";
import { type Part } from "~/server/api/routers/part";
import { type Quote, type Order } from "~/server/api/routers/supplier";

interface SupplierTabsProps {
  supplierId: number;
}

export function SupplierTabs({ supplierId }: SupplierTabsProps) {
  const useGetPartsBySupplierQuery = (args: { supplierId: number }) =>
    api.part.getPartsBySupplierId.useQuery(args);
  const useGetQuotesBySupplierQuery = (args: { supplierId: number }) =>
    api.supplier.getQuotesBySupplierId.useQuery(args);
  const useGetOrdersBySupplierQuery = (args: { supplierId: number }) =>
    api.supplier.getOrdersBySupplierId.useQuery(args);

  return (
    <>
      <Tabs defaultValue="parts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        <TabsContent value="parts" className="space-y-4">
          <GenericTable<Part>
            tableConfig={supplierPartTableConfig}
            useQueryHook={useGetPartsBySupplierQuery}
            supplierId={supplierId}
          />
        </TabsContent>
        <TabsContent value="quotes" className="space-y-4">
          <GenericTable<Quote>
            tableConfig={supplierQuoteTableConfig}
            useQueryHook={useGetQuotesBySupplierQuery}
            supplierId={supplierId}
          />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <GenericTable<Order>
            tableConfig={supplierOrderTableConfig}
            useQueryHook={useGetOrdersBySupplierQuery}
            supplierId={supplierId}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
