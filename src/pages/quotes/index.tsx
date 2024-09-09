import { GenericTable } from "~/components/common/GenericTable";
import { type Quote } from "@prisma/client";
import { quoteTableConfig, useGetAllQuotes } from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import CompareQuotesButton from "~/components/quote-detail/quote-compare";
import { QuoteUploadDialog } from "~/components/quote-detail/quote-upload";

export default function Quote() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  const [checkedQuotes, setCheckedQuotes] = useState<number[]>([]);

  const handleCheckedQuotes = (ids: number[]) => {
    setCheckedQuotes(ids);
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <BreadCrumbWrapper items={[{ label: "Quotes", href: "/quotes" }]} />
        <div className="flex items-center gap-4">
          <CompareQuotesButton
            checkedQuotes={checkedQuotes}
            variant="outline"
          />
          <QuoteUploadDialog />
        </div>
      </div>
      {clerkUserId && (
        <GenericTable<Quote, { clerkUserId: string }>
          tableConfig={quoteTableConfig}
          useQueryHook={useGetAllQuotes}
          queryArgs={{ clerkUserId }}
          handleSelectedRowIdsChange={handleCheckedQuotes}
        />
      )}
    </div>
  );
}
