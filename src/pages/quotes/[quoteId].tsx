import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
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
import { Dialog, DialogTrigger } from "~/components/ui/dialog";
import { useFileHandling } from "~/hooks/use-file-handling";
import { FilePreviewDialog } from "~/components/common/FilePreviewDialog";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { ViewChatButton } from "~/components/chat/view-chat";
import { QuestionAboutLineItems } from "~/components/quote-detail/questions";

const QuotePage = () => {
  const router = useRouter();
  const quoteId = parseInt(router.query.quoteId as string);
  const rfqId = parseInt(router.query.rfqId as string);
  const [isCreatingPO, setIsCreatingPO] = useState(false);
  const [erpPurchaseOrderId, setErpPurchaseOrderId] = useState<number | null>(
    null
  );

  const { isOpen, setIsOpen, isDownloading, handleDownload, handleOpen } =
    useFileHandling();

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
        {!rfqId && (
          <BreadCrumbWrapper
            items={[
              { label: "Quotes", href: "/quotes" },
              { label: `Quote #${quoteId}`, href: `/quotes/${quoteId}` }
            ]}
          />
        )}
        {!isNaN(rfqId) && (
          <BreadCrumbWrapper
            items={[
              { label: "RFQs", href: "/rfqs" },
              { label: `RFQ #${rfqId}`, href: `/rfqs/${rfqId}` },
              { label: `Quote #${quoteId}`, href: `/quotes/${quoteId}` }
            ]}
          />
        )}
        <div className="flex items-center space-x-4">
          <QuestionAboutLineItems quoteId={quoteId} />
          <QuoteHistory
            currentVersion={quoteData.version}
            quoteHistory={quoteData.quoteHistory}
          />
          {quoteData.chatId && (
            <ViewChatButton chatId={quoteData.chatId} rfqId={rfqId} />
          )}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={handleOpen}>
                <Icons.fileText className="mr-2 h-4 w-4" />
                View PDF
              </Button>
            </DialogTrigger>
            <FilePreviewDialog
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              fileKey={quoteData.fileKey}
              isDownloading={isDownloading}
              handleDownload={handleDownload}
            />
          </Dialog>

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
                  `${quoteData.erpQuoteUrl?.replace(
                    "{customId}",
                    erpPurchaseOrderId.toString()
                  )}`,
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
        quotePrice={quoteData.price}
        quotePaymentTerms={quoteData.paymentTerms ?? ""}
        quoteCreatedAt={quoteData.createdAt}
        quoteStatus={quoteData.status}
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
