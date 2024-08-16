import { useRouter } from "next/router";
import { QuoteBreadcrumb } from "~/components/quote-detail/QuoteBreadcrumb";
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
import { DiffBadge } from "~/components/common/DiffBadge";

export default function Compare() {
  const router = useRouter();
  const { ids } = router.query;

  const [idArray, setIdArray] = useState<number[]>([]);

  useEffect(() => {
    if (typeof ids === "string") {
      setIdArray(ids.split(",").filter(Boolean).map(Number));
    }
  }, [ids]);

  const { data: quotesMetaData, isLoading: isMetaDataLoading } =
    api.quote.getQuoteHeadersByIds.useQuery(idArray);

  const { data: quotesBodyData, isLoading: isBodyDataLoading } =
    api.quote.getQuoteComparison.useQuery(idArray) as {
      data: QuoteComparison[] | undefined;
      isLoading: boolean;
    };

  const columnCount = (quotesMetaData?.length ?? 0) + 1;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between pb-4">
          <QuoteBreadcrumb quoteIds={idArray} />
        </div>
        {!isMetaDataLoading && (
          <div
            className={`grid grid-cols-${columnCount} gap-4`}
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
              />
            ))}
          </div>
        )}
      </div>

      {isMetaDataLoading ? (
        <Spinner />
      ) : (
        <div className="flex-grow overflow-hidden">
          <div className="h-full overflow-x-auto">
            <div
              className={`grid grid-cols-${columnCount} h-full min-w-[600px]`}
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
                // Scrollable container start
                <div className="col-span-full h-full overflow-y-auto py-4">
                  <div
                    className={`grid grid-cols-${columnCount} gap-4`}
                    style={{
                      gridTemplateColumns: `repeat(${columnCount}, minmax(150px, 1fr))`
                    }}
                  >
                    {quotesBodyData?.map((lineItem, index: number) => (
                      <React.Fragment key={index}>
                        <div
                          className={`col-span-full grid grid-cols-${columnCount} group rounded-xl hover:bg-gray-50`}
                          style={{
                            gridTemplateColumns: `repeat(${columnCount}, minmax(150px, 1fr))`
                          }}
                        >
                          <div className="col-span-1 flex min-h-20 items-center p-4">
                            <span className="text-caption-bold font-caption-bold text-subtext-color text-s">
                              {lineItem.lineItemDescription?.slice(0, 50)}
                            </span>
                          </div>
                          {lineItem.quotes.map((quote, quoteIndex) => (
                            <Popover key={quoteIndex}>
                              <PopoverTrigger asChild>
                                <div
                                  className="flex items-center justify-end rounded-xl p-4 transition-colors duration-150 hover:bg-gray-100 group-hover:hover:bg-gray-100"
                                  onMouseEnter={(e) => e.currentTarget.click()}
                                  onMouseLeave={(e) => e.currentTarget.click()}
                                >
                                  <DiffBadge number={12} />
                                  <span className="text-heading-3 font-heading-3 text-default-font text-right">
                                    {formatCurrency(
                                      quote.price / quote.quantity
                                    )}
                                  </span>
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="w-56">
                                <div className="text-xs text-gray-600">
                                  <ul className="m-0 list-none p-0">
                                    <li className="flex justify-between">
                                      <span>Quantity:</span>
                                      <span>{quote.quantity}</span>
                                    </li>
                                    <li className="flex justify-between">
                                      <span>Unit Price:</span>
                                      <span>
                                        {formatCurrency(
                                          quote.price / quote.quantity
                                        )}
                                      </span>
                                    </li>
                                    <li className="flex justify-between font-semibold">
                                      <span>Total Price:</span>
                                      <span>{formatCurrency(quote.price)}</span>
                                    </li>
                                  </ul>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ))}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                // Scrollable container end
              )}
            </div>
          </div>
        </div>
      )}
      {/* separator that goes across the entier width of the page */}
      <div className="flex-shrink-0 pb-4">
        <Separator className="w-full" />
      </div>
      <div className="flex-shrink-0">
        <div
          className={`grid grid-cols-${columnCount} gap-4`}
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
    </div>
  );
}
