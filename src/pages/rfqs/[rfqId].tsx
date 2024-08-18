import React, { useEffect, useState } from "react";
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

import {
  statusClassMap,
  TableComponent
} from "~/components/common/TableComponent";
import { cn } from "~/lib/utils";
import { Attachment } from "~/components/chat/attachment";
import { ViewChatButton } from "~/components/chat/view-chat";
import { ViewQuoteButton } from "~/components/quote-detail/quote-viewer";
import { Icons } from "~/components/icons";
import CompareQuotesButton from "~/components/quote-detail/quote-compare";
import { Checkbox } from "~/components/ui/checkbox";
import { TooltipTrigger } from "@radix-ui/react-tooltip";
import { Tooltip, TooltipContent } from "~/components/ui/tooltip";

export default function RfqPage() {
  const router = useRouter();
  const rfqId = parseInt(router.query.rfqId as string);
  const [checkedRows, setCheckedRows] = useState<number[]>([]);

  const handleCheckedRows = (supplierId: number) => {
    setCheckedRows((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  useEffect(() => {
    console.log(checkedRows);
  }, [checkedRows]);

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
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Requested Suppliers</h3>
              <CompareQuotesButton
                checkedQuotes={
                  checkedRows.map(
                    (id) =>
                      rfqData?.suppliers.find((supplier) => supplier.id === id)
                        ?.quoteId
                  ) as number[]
                }
                rfqId={rfqId}
              />
            </div>
          </CardContent>
          <CardContent className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chat</TableHead>
                  <TableHead>Quote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfqData?.suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <Tooltip>
                        <TooltipTrigger>
                          <Checkbox
                            disabled={supplier.quoteId === null}
                            checked={checkedRows.includes(supplier.id)}
                            onCheckedChange={() =>
                              handleCheckedRows(supplier.id)
                            }
                          />
                        </TooltipTrigger>
                        {supplier.quoteId === null && (
                          <TooltipContent side="right">
                            <p>No quote available yet :-)</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TableCell>
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
                      <ViewChatButton chatId={supplier.chatId!} rfqId={rfqId} />
                    </TableCell>
                    <TableCell>
                      <ViewQuoteButton
                        quoteId={supplier.quoteId!}
                        rfqId={rfqId}
                      />
                    </TableCell>
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
