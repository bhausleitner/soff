import React from "react";
import { type Quote } from "@prisma/client";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "~/components/ui/tabs";
import { GenericTable } from "~/components/common/GenericTable";
import {
  type Order,
  type ContactLineItem
} from "~/server/api/routers/supplier";
import {
  supplierOrderTableConfig,
  supplierQuoteTableConfig,
  useGetQuotesBySupplierQuery,
  useGetOrdersBySupplierQuery,
  useGetSupplierContacts,
  supplierContactTableConfig
} from "~/constants/tableConfigs";

interface SupplierTabsProps {
  supplierId: number;
}

export function SupplierTabs({ supplierId }: SupplierTabsProps) {
  return (
    <>
      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
        </TabsList>
        <TabsContent value="contacts" className="space-y-4">
          <GenericTable<ContactLineItem, { supplierId: number }>
            tableConfig={supplierContactTableConfig}
            useQueryHook={useGetSupplierContacts}
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
