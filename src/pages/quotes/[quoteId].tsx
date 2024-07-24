import { useRouter } from "next/router";
import React from "react";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import { QuoteBreadcrumb } from "~/components/quote-detail/QuoteBreadcrumb";
import { QuoteInfo } from "~/components/quote-detail/QuoteInfo";

const QuotePage = () => {
  const router = useRouter();
  const quoteId = parseInt(router.query.quoteId as string, 10);

  if (isNaN(quoteId)) {
    return <Spinner />;
  }

  const { data, isLoading, error } = api.quote.getQuoteById.useQuery({
    quoteId
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>No quote found.</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <QuoteBreadcrumb quoteId={quoteId} />
        <div className="flex items-center"></div>
      </div>
      <QuoteInfo quote={data} />
    </div>
  );
};

export default QuotePage;
