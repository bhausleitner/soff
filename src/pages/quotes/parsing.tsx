import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Currency } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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

import { type ParsedQuoteData } from "~/server/api/routers/quote";
import EditableCell from "./editable-cell";
import PriceHeader from "./price-header";
import PricingTiers from "./pricing-tiers";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";

type PricingTier = ParsedQuoteData["lineItems"][number]["pricingTiers"][number];

const PDFParserPage = () => {
  const router = useRouter();
  const { fileKey, supplierId, chatId, rfqId } = router.query;
  const [name, extension] = extractFilenameParts(fileKey as string);
  const [isManuallyParsing, setIsManuallyParsing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [parsedData, setParsedData] = useState<ParsedQuoteData>({
    lineItems: [],
    currency: Currency.USD
  });

  const createQuoteMutation = api.quote.createQuote.useMutation();

  const handleCurrencyChange = (newCurrency: Currency) => {
    setParsedData((prevData) => ({ ...prevData, currency: newCurrency }));
  };

  const {
    data: parsedQuoteData,
    isLoading: isParsingQuote,
    refetch: refetchParsing
  } = api.quote.parseQuoteDatafromPdf.useQuery(
    {
      fileKey: fileKey as string
    },
    {
      enabled: !!fileKey,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  );

  const handleRetryParsing = async () => {
    setIsManuallyParsing(true);
    try {
      await refetchParsing();
    } finally {
      setIsManuallyParsing(false);
    }
  };

  const toggleExpandItem = (index: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const { data: rfq, isLoading: isLoadingRfq } =
    api.rfq.getRfqFromChatId.useQuery(
      {
        chatId: Number(chatId)
      },
      {
        enabled: !!chatId,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
      }
    );

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

  const handleAutoMatch = useCallback(() => {
    if (!rfq) return;

    setParsedData((prevData) => {
      const newLineItems = prevData.lineItems.map((item) => {
        const matchedRfqItem = rfq.lineItems.find((rfqItem) =>
          item.description
            .toLowerCase()
            .includes(rfqItem?.description?.toLowerCase() ?? "")
        );

        return {
          ...item,
          rfqLineItemId: matchedRfqItem ? matchedRfqItem.id : undefined
        };
      });
      return { ...prevData, lineItems: newLineItems };
    });

    toast.success("Auto-matching completed!");
  }, [rfq]);

  const handleAddLineItem = useCallback(() => {
    setParsedData((prevData) => {
      const newLineItem = {
        partId: "",
        quantity: 0,
        unitPrice: 0,
        description: "",
        pricingTiers: []
      };

      return {
        ...prevData,
        lineItems: [...prevData.lineItems, newLineItem]
      };
    });
  }, []);

  const deleteLineItem = (index: number) => {
    setParsedData((prevData) => {
      const newLineItems = prevData.lineItems.filter((_, i) => i !== index);
      return { ...prevData, lineItems: newLineItems };
    });
  };

  const handleCellEdit = useCallback(
    (
      index: number,
      field: keyof ParsedQuoteData["lineItems"][number],
      value: string | number | undefined
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
            value === "unmatched"
              ? undefined
              : typeof value === "number"
                ? value
                : undefined;
        } else if (field === "partId") {
          updatedItem.partId = value as string;
        }

        newLineItems[index] =
          updatedItem as ParsedQuoteData["lineItems"][number];
        return { ...prevData, lineItems: newLineItems };
      });
    },
    []
  );

  const sortPricingTiers = useCallback((tiers: PricingTier[]) => {
    return [...tiers].sort(
      (a, b) => (a?.minQuantity ?? 0) - (b?.minQuantity ?? 0)
    );
  }, []);

  const handlePricingTierEdit = useCallback(
    (
      lineItemIndex: number,
      tierIndex: number,
      field: string,
      value: string | number
    ) => {
      setParsedData((prevData) => {
        const newLineItems = [...prevData.lineItems];
        const updatedItem = { ...newLineItems[lineItemIndex] };
        const updatedTiers = [...(updatedItem.pricingTiers ?? [])];

        const updatedTier = { ...updatedTiers[tierIndex] };
        if (field === "minQuantity" || field === "maxQuantity") {
          updatedTier[field] = parseInt(value as string) ?? undefined;
        } else if (field === "price") {
          updatedTier[field] = Number(parseFloat(value as string)) ?? 0;
        }

        updatedTiers[tierIndex] = updatedTier as {
          price: number;
          minQuantity: number;
          maxQuantity?: number;
        };
        updatedItem.pricingTiers = updatedTiers;
        newLineItems[lineItemIndex] =
          updatedItem as ParsedQuoteData["lineItems"][number];

        return { ...prevData, lineItems: newLineItems };
      });
    },
    []
  );

  const handlePricingTierBlur = useCallback(
    (lineItemIndex: number) => {
      setParsedData((prevData) => {
        const newLineItems = [...prevData.lineItems];
        const updatedItem = { ...newLineItems[lineItemIndex] };
        const updatedTiers = [...(updatedItem.pricingTiers ?? [])];

        updatedItem.pricingTiers = sortPricingTiers(updatedTiers); // Apply sorting only on blur
        newLineItems[lineItemIndex] =
          updatedItem as ParsedQuoteData["lineItems"][number];

        return { ...prevData, lineItems: newLineItems };
      });
    },
    [sortPricingTiers]
  );

  const deletePricingTier = useCallback(
    (lineItemIndex: number, tierIndex: number) => {
      setParsedData((prevData) => {
        const newLineItems = [...prevData.lineItems];
        const updatedItem = { ...newLineItems[lineItemIndex] };
        const updatedTiers = (updatedItem.pricingTiers ?? []).filter(
          (_, index) => index !== tierIndex
        );

        updatedItem.pricingTiers = updatedTiers;
        newLineItems[lineItemIndex] =
          updatedItem as ParsedQuoteData["lineItems"][number];

        return { ...prevData, lineItems: newLineItems };
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortPricingTiers]
  );

  const addPricingTier = useCallback((lineItemIndex: number) => {
    setParsedData((prevData) => {
      const newLineItems = [...prevData.lineItems];
      const updatedItem = { ...newLineItems[lineItemIndex] };
      const updatedTiers = [...(updatedItem.pricingTiers ?? [])];

      // Find the maximum minQuantity from existing tiers
      const maxMinQuantity = updatedTiers.reduce(
        (max, tier) => Math.max(max, tier?.minQuantity ?? 0),
        -1
      );

      // Add new tier with minQuantity set to maxMinQuantity + 1
      updatedTiers.push({ minQuantity: maxMinQuantity + 1, price: 0 });
      updatedItem.pricingTiers = sortPricingTiers(updatedTiers);
      newLineItems[lineItemIndex] =
        updatedItem as ParsedQuoteData["lineItems"][number];

      return { ...prevData, lineItems: newLineItems };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAvailableCategories = useCallback(
    (currentIndex: number) => {
      if (!rfq) return [];

      const usedCategories = parsedData.lineItems
        .filter((_, index) => index !== currentIndex)
        .map((item) => item.rfqLineItemId)
        .filter(Boolean);

      return rfq.lineItems.filter(
        (lineItem) => !usedCategories.includes(lineItem.id)
      );
    },
    [parsedData.lineItems, rfq]
  );

  const renderTableContent = () => {
    if (isParsingQuote || isLoadingRfq || isManuallyParsing) {
      const skeletonCount = rfq?.lineItems?.length ?? 3;
      return (
        <TableBody>
          {Array.from({ length: skeletonCount }).map((_, index) => (
            <TableRow key={index}>
              <TableCell></TableCell>
              <TableCell>
                <Skeleton className="h-6 w-full" />
              </TableCell>
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
              <TableCell>
                <Skeleton className="h-6 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }

    return (
      <TableBody>
        {parsedData.lineItems.map((item, index) => (
          <>
            <TableRow
              className={cn("group", expandedItems.has(index) && "bg-gray-50")}
            >
              <TableCell>
                {item.pricingTiers && item.pricingTiers.length > 0 ? (
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => toggleExpandItem(index)}
                      >
                        <Icons.chevronRight
                          className={`h-4 w-4 transition-transform ${
                            expandedItems.has(index) ? "rotate-90" : ""
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Show Pricing Tiers</TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => addPricingTier(index)}
                      >
                        <Icons.add className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Pricing Tiers</TooltipContent>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                <EditableCell
                  value={item.partId}
                  onEdit={(value) =>
                    handleCellEdit(index, "partId", value ?? "")
                  }
                  type="text"
                />
              </TableCell>
              <TableCell>
                <EditableCell
                  value={item.description}
                  onEdit={(value) =>
                    handleCellEdit(index, "description", value ?? "")
                  }
                  type="text"
                />
              </TableCell>
              <TableCell>
                <EditableCell
                  value={item.quantity}
                  onEdit={(value) =>
                    handleCellEdit(index, "quantity", value ?? "")
                  }
                  type="number"
                />
              </TableCell>
              <TableCell>
                <EditableCell
                  value={item.unitPrice}
                  onEdit={(value) =>
                    handleCellEdit(index, "unitPrice", value ?? "")
                  }
                  type={parsedData.currency}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={item.rfqLineItemId?.toString() ?? "unmatched"}
                  onValueChange={(value) =>
                    handleCellEdit(
                      index,
                      "rfqLineItemId",
                      value === "unmatched" ? undefined : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a line item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unmatched">Unmatched</SelectItem>
                    {getAvailableCategories(index).map((lineItem) => (
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
              <TableCell className="pl-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0 hover:text-red-600"
                  onClick={() => deleteLineItem(index)}
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            {expandedItems.has(index) &&
              item.pricingTiers &&
              item.pricingTiers.length > 0 && (
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={7} className="p-0">
                    <PricingTiers
                      pricingTiers={item.pricingTiers ?? []}
                      currency={parsedData.currency}
                      onPricingTierEdit={(tierIndex, field, value) =>
                        handlePricingTierEdit(index, tierIndex, field, value)
                      }
                      onPricingTierBlur={() => handlePricingTierBlur(index)}
                      onDeletePricingTier={(tierIndex) =>
                        deletePricingTier(index, tierIndex)
                      }
                      onAddPricingTier={() => addPricingTier(index)}
                    />
                  </TableCell>
                </TableRow>
              )}
          </>
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
            className="w-40"
            variant="outline"
            onClick={handleAutoMatch}
            disabled={isParsingQuote || isLoadingRfq}
          >
            Auto-Match
            <Icons.sparkles className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="soff"
            onClick={() => {
              void toast.promise(
                createQuoteMutation.mutateAsync({
                  supplierId: Number(supplierId),
                  chatId: Number(chatId),
                  fileKey: String(fileKey),
                  parsedData: {
                    lineItems: parsedData.lineItems.filter(
                      (item) => item.rfqLineItemId !== undefined
                    ),
                    currency: parsedData.currency
                  }
                }),
                {
                  loading: "Adding quote...",
                  success: () => {
                    void router.push(`/rfqs/${String(rfqId)}`);
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
          <ResizablePanel defaultSize={35} minSize={30}>
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
          <ResizablePanel defaultSize={75} minSize={30}>
            <Card className="flex h-full w-full flex-col">
              <CardHeader>
                <CardTitle>Parsed Data</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead className="text-center">Part ID</TableHead>
                      <TableHead className="text-center">Description</TableHead>
                      <TableHead className="text-center">Quantity</TableHead>
                      <PriceHeader
                        currency={parsedData.currency}
                        onCurrencyChange={handleCurrencyChange}
                      />
                      <TableHead className="text-center">
                        RFQ Lineitem
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>

                  {renderTableContent()}
                </Table>
                {!isParsingQuote && (
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    transition={{ duration: 0.2 }}
                    className="m-2 rounded-md"
                  >
                    <Button
                      variant="ghost"
                      className="w-full rounded-xl py-2 text-blue-500 hover:text-blue-700"
                      onClick={handleAddLineItem}
                    >
                      <Icons.add className="mr-2 h-4 w-4" />
                      Add Line Item
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
};

export default PDFParserPage;
