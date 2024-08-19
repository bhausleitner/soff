import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Skeleton } from "~/components/ui/skeleton";
import PDFViewer from "~/components/chat/pdf-viewer";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { extractFilenameParts } from "~/utils/string-format";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "~/components/ui/resizable";
import { Icons } from "~/components/icons";
import { toast } from "sonner";

interface ParsedQuoteData {
  lineItems: {
    quantity: number;
    unitPrice: number;
    description: string;
    rfqLineItemId?: number;
  }[];
}

const PDFParserPage = () => {
  const router = useRouter();
  const { fileKey, supplierId, chatId, rfqId } = router.query;
  const [name, extension] = extractFilenameParts(fileKey as string);
  const [isManuallyParsing, setIsManuallyParsing] = useState(false);

  const {
    data: parsedQuoteData,
    isLoading: isParsingQuote,
    refetch: refetchParsing
  } = api.quote.parseQuoteDatafromPdf.useQuery({
    fileKey: fileKey as string
  });

  const { data: rfq, isLoading: isLoadingRfq } =
    api.rfq.getRfqFromChatId.useQuery({
      chatId: Number(chatId)
    });

  const createQuoteMutation = api.quote.createQuote.useMutation();

  const [parsedData, setParsedData] = useState<ParsedQuoteData>({
    lineItems: []
  });

  useEffect(() => {
    if (parsedQuoteData) {
      setParsedData(parsedQuoteData);
    }
  }, [parsedQuoteData]);

  useEffect(() => {
    if (isParsingQuote || isLoadingRfq || isManuallyParsing) {
      toast.loading("Parsing data from Quote...", {
        duration: Infinity,
        id: "loading-toast"
      });
    } else {
      toast.dismiss("loading-toast");
      toast.success("Quote data parsed successfully!");
    }
  }, [isParsingQuote, isLoadingRfq, isManuallyParsing]);

  const handleCellEdit = (
    index: number,
    field: keyof ParsedQuoteData["lineItems"][number],
    value: string | number
  ) => {
    setParsedData((prevData) => {
      const newLineItems = [...prevData.lineItems];
      const updatedItem = { ...newLineItems[index] };

      if (field === "quantity") {
        updatedItem.quantity = parseInt(value as string) || 0;
      } else if (field === "unitPrice") {
        updatedItem.unitPrice = Number(parseFloat(value as string)) || 0;
      } else if (field === "description") {
        updatedItem.description = value as string;
      } else if (field === "rfqLineItemId") {
        updatedItem.rfqLineItemId =
          typeof value === "number" ? value : undefined;
      }

      newLineItems[index] = updatedItem as ParsedQuoteData["lineItems"][number];
      return { ...prevData, lineItems: newLineItems };
    });
  };

  const getAvailableCategories = (currentIndex: number) => {
    const usedCategories = parsedData.lineItems
      .filter((_, index) => index !== currentIndex)
      .map((item) => item.rfqLineItemId)
      .filter(Boolean);
    return rfq?.lineItems.filter(
      (lineItem) => !usedCategories.includes(lineItem.id)
    );
  };

  const truncateDescription = (description: string, maxLength = 20) => {
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
  };

  const handleRetryParsing = async () => {
    setIsManuallyParsing(true);
    try {
      await refetchParsing();
    } finally {
      setIsManuallyParsing(false);
    }
  };

  const renderTableContent = () => {
    if (isParsingQuote || isLoadingRfq || isManuallyParsing) {
      const skeletonCount = rfq?.lineItems?.length ?? 3;
      return (
        <TableBody>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-6 w-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-[180px]" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    return (
      <TableBody>
        {parsedData.lineItems.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto cursor-text p-1 hover:bg-blue-100"
                  >
                    {truncateDescription(item.description)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <Textarea
                    value={item.description}
                    onChange={(e) =>
                      handleCellEdit(index, "description", e.target.value)
                    }
                    className="min-h-[100px]"
                  />
                </PopoverContent>
              </Popover>
            </TableCell>
            <TableCell>
              <Input
                className="w-20"
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleCellEdit(index, "quantity", e.target.value)
                }
              />
            </TableCell>
            <TableCell>
              <Input
                className="w-24"
                type="number"
                value={item.unitPrice}
                onChange={(e) =>
                  handleCellEdit(index, "unitPrice", e.target.value)
                }
              />
            </TableCell>
            <TableCell>
              <Select
                value={item.rfqLineItemId?.toString()}
                onValueChange={(value) =>
                  handleCellEdit(index, "rfqLineItemId", parseInt(value))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableCategories(index)?.map((lineItem) => (
                    <SelectItem
                      key={lineItem.id}
                      value={lineItem.id.toString()}
                    >
                      {lineItem.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    );
  };

  return (
    <>
      <div className="flex flex-row justify-between">
        <BreadCrumbWrapper
          items={[
            {
              label: "RFQs",
              href: "/rfqs"
            },
            {
              label: `RFQ #${String(rfqId) ?? ""}`,
              href: `/rfqs/${String(rfqId) ?? ""}`
            },
            {
              label: `Chat #${String(chatId) ?? ""}`,
              href: `/chat/${String(chatId) ?? ""}`
            },
            {
              label: "Quote Parsing",
              href: `/quotes/parsing`
            }
          ]}
        />
        <div className="flex flex-row gap-4">
          <Button
            className="w-40"
            variant="outline"
            onClick={handleRetryParsing}
            disabled={isManuallyParsing || isParsingQuote || isLoadingRfq}
          >
            {isManuallyParsing ? (
              <Icons.loaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Retry Parsing
                <Icons.rescan className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <Button
            variant="soff"
            onClick={() => {
              void toast.promise(
                createQuoteMutation.mutateAsync({
                  supplierId: Number(supplierId),
                  chatId: Number(chatId),
                  fileKey: String(fileKey),
                  parsedData: parsedData
                }),
                {
                  loading: "Adding quote...",
                  success: (result) => {
                    const quoteId =
                      typeof result === "object" && "quoteId" in result
                        ? result.quoteId
                        : result;
                    void router.push(
                      `/quotes/${quoteId}?rfqId=${String(rfqId) ?? ""}`
                    );
                    return "Quote added successfully!";
                  },
                  error: "Failed to add quote. Please try again."
                }
              );
            }}
          >
            Add Quote
            <Icons.quotes className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="mt-5">
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-10rem)] gap-5"
        >
          <ResizablePanel defaultSize={40} minSize={30}>
            <Card className="mr-5 h-full w-full">
              <CardHeader>
                <CardTitle>
                  {name}
                  <span className="text-gray-500">.{extension}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-4rem)]">
                <PDFViewer fileKey={fileKey as string} isDialog={false} />
              </CardContent>
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={60} minSize={30}>
            <Card className="flex h-full w-full flex-col">
              <CardHeader>
                <CardTitle>Parsed Data</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price [USD]</TableHead>
                      <TableHead>RFQ Lineitem</TableHead>
                    </TableRow>
                  </TableHeader>
                  {renderTableContent()}
                </Table>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
};

export default PDFParserPage;
