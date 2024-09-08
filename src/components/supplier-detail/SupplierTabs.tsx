import React from "react";
import { type Quote } from "@prisma/client";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "~/components/ui/tabs";
import { GenericTable } from "~/components/common/GenericTable";
import { type Part } from "~/server/api/routers/part";
import { type Order } from "~/server/api/routers/supplier";
import {
  supplierOrderTableConfig,
  supplierPartTableConfig,
  supplierQuoteTableConfig,
  useGetPartsBySupplierQuery,
  useGetQuotesBySupplierQuery,
  useGetOrdersBySupplierQuery
} from "~/constants/tableConfigs";

interface SupplierTabsProps {
  supplierId: number;
}

export function SupplierTabs({ supplierId }: SupplierTabsProps) {
  return (
    <>
      <Tabs defaultValue="parts">
        <TabsList>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        <TabsContent value="parts" className="space-y-4">
          <GenericTable<Part, { supplierId: number }>
            tableConfig={supplierPartTableConfig}
            useQueryHook={useGetPartsBySupplierQuery}
            queryArgs={{ supplierId }}
          />
        </TabsContent>
        <TabsContent value="quotes" className="space-y-4">
          <GenericTable<Quote, { supplierId: number }>
            tableConfig={supplierQuoteTableConfig}
            useQueryHook={useGetQuotesBySupplierQuery}
            queryArgs={{ supplierId }}
          />
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <GenericTable<Order, { supplierId: number }>
            tableConfig={supplierOrderTableConfig}
            useQueryHook={useGetOrdersBySupplierQuery}
            queryArgs={{ supplierId }}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
