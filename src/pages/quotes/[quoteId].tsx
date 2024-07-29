import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import { QuoteBreadcrumb } from "~/components/quote-detail/QuoteBreadcrumb";
import { QuoteInfo } from "~/components/quote-detail/QuoteInfo";
import {
  quoteOrderTableConfig,
  useGetOrdersByQuoteQuery
} from "~/constants/tableConfigs";
import { GenericTable } from "~/components/common/GenericTable";
import { type Order } from "~/server/api/routers/supplier";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";

const QuotePage = () => {
  const router = useRouter();
  const quoteId = parseInt(router.query.quoteId as string, 10);

  const {
    data: quoteData,
    isLoading: quoteLoading,
    error: quoteError
  } = api.quote.getQuoteById.useQuery({
    quoteId: !isNaN(quoteId) ? quoteId : 0
  });

  console.log("Data: ", quoteData);

  const {
    data: supplierData,
    isLoading: supplierLoading,
    error: supplierError
  } = api.supplier.getSupplierById.useQuery(
    {
      supplierId: quoteData?.supplierId ?? 0
    },
    {
      enabled: !!quoteData?.supplierId
    }
  );

  if (isNaN(quoteId)) {
    return <Spinner />;
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

  if (supplierLoading) {
    return <Spinner />;
  }

  if (supplierError) {
    return <p>Error: {supplierError.message}</p>;
  }

  if (!supplierData) {
    return <p>No supplier found.</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <QuoteBreadcrumb quoteId={quoteId} />
        <div className="flex items-center">
          <Button>
            <>
              Add to Odoo
              <Icons.sendHorizontal className="ml-2 h-4 w-4" />
            </>
          </Button>
        </div>
      </div>
      <QuoteInfo quote={quoteData} supplier={supplierData} />
      <GenericTable<Order, { quoteId: number }>
        tableConfig={quoteOrderTableConfig}
        useQueryHook={useGetOrdersByQuoteQuery}
        queryArgs={{ quoteId }}
      />
    </div>
  );
};

export default QuotePage;
