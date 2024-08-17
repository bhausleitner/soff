import React, { useState } from "react";
import { useRouter } from "next/router";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { api } from "~/utils/api";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import { statusClassMap } from "~/components/common/TableComponent";
import { cn } from "~/lib/utils";
import { Attachment } from "~/components/chat/attachment";

export default function RfqPage() {
  const router = useRouter();
  const rfqId = parseInt(router.query.rfqId as string);

  const { data: rfqData, isLoading } = api.rfq.getRfq.useQuery({ rfqId });

  return (
    <div className="flex h-full flex-col space-y-4">
      <BreadCrumbWrapper
        items={[
          { label: "RFQs", href: "/rfqs" },
          { label: `RFQ #${rfqId}`, href: `/rfqs/${rfqId}` }
        ]}
      />

      <div className="flex flex-col space-y-4 overflow-hidden">
        {rfqData && (
          <Card className="flex-shrink-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium">RFQ Package</h3>
                  <Badge className={cn(statusClassMap[rfqData?.status])}>
                    {rfqData?.status || "Loading..."}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardContent className="max-h-[300px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Attachments</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfqData?.rfqLineItems.map((lineItem) => (
                    <TableRow key={lineItem.id}>
                      <TableCell>{lineItem.description}</TableCell>
                      <TableCell>{lineItem.quantity}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {lineItem.fileNames.map((fileName, index) => (
                            <Attachment
                              key={index}
                              fileKey={fileName}
                              isUserMessage={true}
                              supplierId={0}
                              chatId={0}
                            />
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card className="flex flex-1 flex-col">
          <CardHeader>
            <CardTitle>Requested Suppliers</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Quote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfqData?.suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          statusClassMap[
                            supplier.status as keyof typeof statusClassMap
                          ]
                        )}
                      >
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await router.push(
                            `/chat/${supplier.chatId}?rfqId=${rfqId}`
                          );
                        }}
                      >
                        View Chat
                      </Button>
                    </TableCell>
                    <TableCell>Quote</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
