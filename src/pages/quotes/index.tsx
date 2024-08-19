import { GenericTable } from "~/components/common/GenericTable";
import { type Quote } from "~/server/api/routers/quote";
import { quoteTableConfig, useGetAllQuotes } from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import CompareQuotesButton from "~/components/quote-detail/quote-compare";

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
        <CompareQuotesButton checkedQuotes={checkedQuotes} />
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
