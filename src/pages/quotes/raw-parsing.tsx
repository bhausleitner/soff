import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
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
import { cn } from "~/lib/utils";
import EditableCell from "./editable-cell";

type PricingTier = ParsedQuoteData["lineItems"][number]["pricingTiers"][number];

const RawPDFParserPage = () => {
  const router = useRouter();
  const { fileKey } = router.query;
  const [name, extension] = extractFilenameParts(fileKey as string);
  const [isManuallyParsing, setIsManuallyParsing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const {
    data: parsedQuoteData,
    isLoading: isParsingQuote,
    refetch: refetchParsing
  } = api.quote.parseQuoteDatafromPdf.useQuery({
    fileKey: fileKey as string
  });

  const createQuoteMutation = api.quote.createRawQuote.useMutation();

  const [parsedData, setParsedData] = useState<ParsedQuoteData>({
    lineItems: []
  });

  useEffect(() => {
    if (parsedQuoteData) {
      setParsedData(parsedQuoteData);
    }
  }, [parsedQuoteData]);

  useEffect(() => {
    if (isParsingQuote || isManuallyParsing) {
      toast.loading("Parsing data from Quote...", {
        duration: Infinity,
        id: "loading-toast"
      });
    } else {
      toast.dismiss("loading-toast");
      toast.success("Quote data parsed successfully!");
    }
  }, [isParsingQuote, isManuallyParsing]);

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
  }, []);

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
    [sortPricingTiers]
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

  const deleteLineItem = (index: number) => {
    setParsedData((prevData) => {
      const newLineItems = prevData.lineItems.filter((_, i) => i !== index);
      return { ...prevData, lineItems: newLineItems };
    });
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const renderTableContent = () => {
    if (isParsingQuote || isManuallyParsing) {
      const skeletonCount = 4;
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
          <React.Fragment key={index}>
            <TableRow
              className={cn("group", expandedItems.has(index) && "bg-gray-50")}
            >
              <TableCell>
                <div className="flex items-center space-x-2">
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
                  <EditableCell
                    value={item.description}
                    onEdit={(value) =>
                      handleCellEdit(index, "description", value ?? "")
                    }
                    type="text"
                  />
                </div>
              </TableCell>
              <TableCell>
                <EditableCell
                  value={item.quantity}
                  onEdit={(value) =>
                    handleCellEdit(index, "quantity", value ?? 0)
                  }
                  type="number"
                />
              </TableCell>
              <TableCell>
                <EditableCell
                  value={item.unitPrice}
                  onEdit={(value) =>
                    handleCellEdit(index, "unitPrice", value ?? 0)
                  }
                  type="number"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-red-600"
                  onClick={() => deleteLineItem(index)}
                >
                  <Icons.trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
            {expandedItems.has(index) && (
              <TableRow className="bg-gray-50">
                <TableCell colSpan={4} className="p-0">
                  <Card className="m-2 overflow-hidden">
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b">
                            <TableHead className="w-1/4 py-2 text-xs font-medium">
                              Min Quantity
                            </TableHead>
                            <TableHead className="w-1/4 py-2 text-xs font-medium">
                              Max Quantity
                            </TableHead>
                            <TableHead className="w-1/4 py-2 text-xs font-medium">
                              Price [USD]
                            </TableHead>
                            <TableHead className="w-1/4 py-2"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <AnimatePresence>
                            {(item.pricingTiers || []).map(
                              (tier, tierIndex) => (
                                <motion.tr
                                  key={tierIndex}
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.2 }}
                                  layout
                                  className="border-b last:border-b-0"
                                >
                                  <TableCell className="py-1">
                                    <EditableCell
                                      value={tier?.minQuantity ?? 0}
                                      onEdit={(value) => {
                                        handlePricingTierEdit(
                                          index,
                                          tierIndex,
                                          "minQuantity",
                                          value ?? 0
                                        );
                                        handlePricingTierBlur(index);
                                      }}
                                      type="number"
                                    />
                                  </TableCell>
                                  <TableCell className="py-1">
                                    <EditableCell
                                      value={tier?.maxQuantity ?? "∞"}
                                      onEdit={(value) =>
                                        handlePricingTierEdit(
                                          index,
                                          tierIndex,
                                          "maxQuantity",
                                          value ?? 0
                                        )
                                      }
                                      type="number"
                                      isMaxQuantity={true}
                                    />
                                  </TableCell>
                                  <TableCell className="py-1">
                                    <EditableCell
                                      value={tier?.price ?? 0}
                                      onEdit={(value) =>
                                        handlePricingTierEdit(
                                          index,
                                          tierIndex,
                                          "price",
                                          value ?? 0
                                        )
                                      }
                                      type="number"
                                    />
                                  </TableCell>
                                  <TableCell className="py-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="hover:text-red-600"
                                      onClick={() =>
                                        deletePricingTier(index, tierIndex)
                                      }
                                    >
                                      <Icons.trash className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </motion.tr>
                              )
                            )}
                          </AnimatePresence>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                    transition={{ duration: 0.2 }}
                    className="m-2 rounded-md"
                  >
                    <Button
                      variant="ghost"
                      className="w-full rounded-xl py-2 text-blue-500 hover:text-blue-700"
                      onClick={() => addPricingTier(index)}
                    >
                      <Icons.add className="mr-2 h-4 w-4" />
                      Add Pricing Tier
                    </Button>
                  </motion.div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
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
              label: "Quotes",
              href: "/quotes"
            },
            {
              label: `Raw Parsing`,
              href: `/quotes/raw-parsing`
            }
          ]}
        />
        <div className="flex flex-row gap-4">
          <Button
            className="w-40"
            variant="outline"
            onClick={handleRetryParsing}
            disabled={isManuallyParsing || isParsingQuote}
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
                  supplierId: 1,
                  fileKey: String(fileKey),
                  parsedData: parsedData
                }),
                {
                  loading: "Adding quote...",
                  success: ({ quoteId }) => {
                    void router.push(`/quotes/${String(quoteId)}`);
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
                      <TableHead className="w-[70px]"></TableHead>
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

export default RawPDFParserPage;
