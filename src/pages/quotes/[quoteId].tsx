import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import { QuoteBreadcrumb } from "~/components/quote-detail/QuoteBreadcrumb";
import { QuoteInfo } from "~/components/quote-detail/QuoteInfo";
import {
  quoteLineItemTableConfig,
  useGetLineItemsByQuoteQuery
} from "~/constants/tableConfigs";
import { GenericTable } from "~/components/common/GenericTable";
import { type LineItem } from "~/server/api/routers/quote";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { toast } from "sonner";
import { QuoteHistory } from "~/components/quote-detail/quote-history";

const QuotePage = () => {
  const router = useRouter();
  const quoteId = parseInt(router.query.quoteId as string, 10);
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [erpPurchaseOrderId, setErpPurchaseOrderId] = useState<number | null>(
    null
  );

  const purchaseOrderMutation = api.quote.createPurchaseOrder.useMutation();

  const handleAddToOdoo = async () => {
    try {
      setIsCreatingPO(true);
      const odooId = await purchaseOrderMutation.mutateAsync({
        quoteId
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

  const {
    data: quoteData,
    isLoading: quoteLoading,
    error: quoteError
  } = api.quote.getQuoteById.useQuery({
    quoteId: quoteId
  });

  useEffect(() => {
    if (quoteData?.erpPurchaseOrderId) {
      setErpPurchaseOrderId(quoteData.erpPurchaseOrderId);
    }
  }, [quoteData]);

  if (isNaN(quoteId)) {
    return <p>Invalid quote ID.</p>;
  }

  if (quoteLoading) {
    return <Spinner />;
  }

  if (quoteError) {
    return <p>Error: {quoteError.message}</p>;
  }

  if (!quoteData) {
    return <p>No quote found.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <QuoteBreadcrumb quoteId={quoteId} />
        <div className="flex items-center space-x-4">
          <QuoteHistory
            currentVersion={quoteData.version}
            quoteHistory={quoteData.quoteHistory}
          />
          {quoteData.chatId && (
            <Button
              variant="outline"
              onClick={() => router.push(`/rfq/${quoteData.chatId}`)}
            >
              <Icons.messageCircleMore className="mr-2 h-4 w-4" />
              Show Chat
            </Button>
          )}

          {!erpPurchaseOrderId && (
            <Button
              variant="blue"
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
                  `${quoteData.erpUrl}/odoo/purchase/${erpPurchaseOrderId}`,
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
      <QuoteInfo
        quote={quoteData}
        supplierName={quoteData.supplierName}
        supplierContactPerson={quoteData.supplierContactPerson}
        supplierEmail={quoteData.supplierEmail}
      />
      <GenericTable<LineItem, { quoteId: number }>
        tableConfig={quoteLineItemTableConfig}
        useQueryHook={useGetLineItemsByQuoteQuery}
        queryArgs={{ quoteId }}
      />
    </div>
  );
};

export default QuotePage;
