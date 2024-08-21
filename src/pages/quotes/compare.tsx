import { useRouter } from "next/router";
import CompareHeader from "./compare-header";
import { api } from "~/utils/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "~/components/ui/popover";
import { Skeleton } from "~/components/ui/skeleton";
import { formatCurrency } from "~/utils/string-format";
import React, { useEffect, useState } from "react";
import Spinner from "~/components/spinner";
import { type QuoteComparison } from "~/utils/quote-helper";
import { Separator } from "~/components/ui/separator";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { toast } from "sonner";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";

export default function Compare() {
  const router = useRouter();
  const { ids } = router.query;
  const rfqId = parseInt(router.query.rfqId as string);
  const [idArray, setIdArray] = useState<number[]>([]);
  const [detailedMode, setDetailedMode] = useState(false);
  const [selectedQuotes, setSelectedQuotes] = useState<number[]>([]);
  const [erpPurchaseOrderId, setErpPurchaseOrderId] = useState<number | null>(
    null
  );
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const purchaseOrderMutation = api.quote.createPurchaseOrder.useMutation();

  const handleAddToOdoo = async () => {
    try {
      setIsCreatingPO(true);
      const odooId = await purchaseOrderMutation.mutateAsync({
        quoteId: Number(selectedQuotes[0])
      });
      setErpPurchaseOrderId(odooId);
      toast.success("Purchase order created in Odoo.");
    } catch (error) {
      console.error("Error in handleCreateQuote:", error);
      toast.error("Failed to create PO. Please try again.");
    } finally {
      setIsCreatingPO(false);
    }
  };

  useEffect(() => {
    if (typeof ids === "string") {
      const newIdArray = ids.split(",").filter(Boolean).map(Number);
      setIdArray(newIdArray);
      setSelectedQuotes(newIdArray);
    }
  }, [ids]);

  const { data: quotesMetaData, isLoading: isMetaDataLoading } =
    api.quote.getQuoteHeadersByIds.useQuery(idArray);

  const { data: quotesBodyData, isLoading: isBodyDataLoading } =
    api.quote.getQuoteComparison.useQuery(idArray) as {
      data: QuoteComparison[] | undefined;
      isLoading: boolean;
    };

  useEffect(() => {
    if (isBodyDataLoading) {
      toast.loading("Running comparison...", {
        duration: Infinity,
        id: "loading-toast"
      });
    } else {
      toast.dismiss("loading-toast");
      toast.success("Comparison finished!");
    }
  }, [isBodyDataLoading]);

  const handleQuoteSelection = (quoteId: number) => {
    setSelectedQuotes((prev) =>
      prev.includes(quoteId)
        ? prev.filter((id) => id !== quoteId)
        : [...prev, quoteId]
    );
  };

  const columnCount = (quotesMetaData?.length ?? 0) + 1;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between pb-4">
          {!rfqId && (
            <BreadCrumbWrapper
              items={[
                {
                  label: "Quotes",
                  href: "/quotes"
                },
                {
                  label: `Quote #${idArray.join(" vs. #")}`,
                  href: `/quotes/compare?ids=${idArray.join(",")}`
                }
              ]}
            />
          )}
          {!isNaN(rfqId) && (
            <BreadCrumbWrapper
              items={[
                {
                  label: "RFQs",
                  href: "/rfqs"
                },
                {
                  label: `RFQ #${rfqId}`,
                  href: `/rfqs/${rfqId}`
                },
                {
                  label: `Quote #${idArray.join(" vs. #")}`,
                  href: `/quotes/compare?ids=${idArray.join(",")}&rfqId=${rfqId}`
                }
              ]}
            />
          )}
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="detailed-mode"
                checked={detailedMode}
                onCheckedChange={setDetailedMode}
              />
              <Label htmlFor="detailed-mode">Details on Hover</Label>
            </div>
            {!erpPurchaseOrderId && (
              <Button
                variant="soff"
                className="w-36"
                onClick={() => handleAddToOdoo()}
                disabled={isCreatingPO}
              >
                {isCreatingPO ? (
                  <Icons.loaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Icons.odoo className="mr-2 h-4 w-4" />
                    Add to Odoo
                  </>
                )}
              </Button>
            )}
            {!!erpPurchaseOrderId && (
              <Button
                className="w-36"
                variant="outline"
                onClick={async () =>
                  window.open(
                    `${quotesMetaData?.[0]?.supplier?.organization?.erpUrl}/odoo/purchase/${erpPurchaseOrderId}`,
                    "_blank"
                  )
                }
              >
                <Icons.odooLogo className="mr-2 h-4 w-4" />
                View in Odoo
              </Button>
            )}
          </div>
        </div>
        {!isMetaDataLoading && (
          <div
            className={`grid gap-4`}
            style={{
              gridTemplateColumns: `repeat(${columnCount}, minmax(150px, 1fr))`
            }}
          >
            <div className="col-span-1" />
            {quotesMetaData?.map((quote) => (
              <CompareHeader
                key={quote.id}
                supplierName={quote.supplier.name}
                quoteId={quote.id}
                fileKey={quote.fileKey ?? ""}
                isSelected={selectedQuotes.includes(quote.id)}
                onSelect={handleQuoteSelection}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body section */}
      {isMetaDataLoading ? (
        <Spinner />
      ) : (
        <div className="flex-grow overflow-hidden">
          <div className="h-full overflow-x-auto">
            <div
              className="h-full min-w-[600px]"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(150px, 1fr))`
              }}
            >
              {isBodyDataLoading ? (
                <div className="col-span-full space-y-6 py-6">
                  {Array(4)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="grid gap-4"
                        style={{
                          gridTemplateColumns: `repeat(${columnCount}, minmax(150px, 1fr))`
                        }}
                      >
                        <Skeleton className="h-20 w-full" />
                        {Array(columnCount - 1)
                          .fill(0)
                          .map((_, colIndex) => (
                            <Skeleton key={colIndex} className="h-14 w-full" />
                          ))}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="col-span-full h-full overflow-y-auto py-4">
                  <div
                    className="grid gap-4"
                    style={{
                      gridTemplateColumns: `repeat(${columnCount}, minmax(150px, 1fr))`
                    }}
                  >
                    {quotesBodyData?.map((lineItem, index: number) => (
                      <React.Fragment key={index}>
                        <div
                          className="group col-span-full grid rounded-xl hover:bg-gray-50"
                          style={{
                            gridTemplateColumns: `repeat(${columnCount}, minmax(150px, 1fr))`
                          }}
                        >
                          <div className="col-span-1 flex min-h-20 items-center p-4">
                            <span className="text-caption-bold font-caption-bold text-subtext-color text-s">
                              {lineItem.rfqLineItemDescription?.slice(0, 100)}
                            </span>
                          </div>
                          {quotesMetaData?.map((metaQuote) => {
                            const quote = lineItem.quotes.find(
                              (q) => q.quoteId === metaQuote.id
                            );
                            return (
                              <Popover key={metaQuote.id}>
                                <PopoverTrigger asChild>
                                  <div
                                    className="flex items-center justify-end rounded-xl p-4 transition-colors duration-150 hover:bg-gray-100 group-hover:hover:bg-gray-100"
                                    onMouseEnter={(e) =>
                                      e.currentTarget.click()
                                    }
                                    onMouseLeave={(e) =>
                                      e.currentTarget.click()
                                    }
                                  >
                                    <span className="text-heading-3 font-heading-3 text-default-font text-right">
                                      {quote
                                        ? formatCurrency(
                                            quote.price / quote.quantity
                                          )
                                        : "N/A"}
                                    </span>
                                  </div>
                                </PopoverTrigger>
                                {quote && detailedMode && (
                                  <PopoverContent>
                                    <div className="p-4">
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="text-sm font-medium text-gray-500">
                                            Lineitem:
                                          </h4>
                                          <p className="text-sm">
                                            {quote?.originalDescription ??
                                              "N/A"}
                                          </p>
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">
                                              Quantity:
                                            </span>
                                            <span className="text-sm font-medium">
                                              {quote?.quantity ?? "N/A"}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-sm text-gray-500">
                                              Unit Price:
                                            </span>
                                            <span className="text-sm font-medium">
                                              {quote
                                                ? formatCurrency(
                                                    quote.price / quote.quantity
                                                  )
                                                : "N/A"}
                                            </span>
                                          </div>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-gray-500">
                                            Total Price:
                                          </span>
                                          <span className="text-lg font-semibold">
                                            {quote
                                              ? formatCurrency(quote.price)
                                              : "N/A"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                )}
                              </Popover>
                            );
                          })}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer section */}
      {!isMetaDataLoading && (
        <>
          <div className="flex-shrink-0 pb-4">
            <Separator className="w-full" />
          </div>
          <div className="flex-shrink-0">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(150px, 1fr))`
              }}
            >
              <div className="col-span-1 p-2 font-bold">
                <span className="text-caption-bold font-caption-bold text-subtext-color text-s">
                  Total
                </span>
              </div>
              {quotesMetaData?.map((quote, index) => (
                <div key={index} className="flex items-center justify-end px-2">
                  <span className="text-heading-3 font-heading-3 text-default-font text-right font-bold">
                    {formatCurrency(quote.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
