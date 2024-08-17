import { GenericTable } from "~/components/common/GenericTable";
import { type Quote } from "~/server/api/routers/quote";
import { quoteTableConfig, useGetAllQuotes } from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";

export default function Quote() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  const [checkedQuotes, setCheckedQuotes] = useState<number[]>([]);
  const router = useRouter();

  const handleCheckedQuotes = (ids: number[]) => {
    setCheckedQuotes(ids);
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <BreadCrumbWrapper items={[{ label: "Quotes", href: "/quotes" }]} />
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                disabled={checkedQuotes.length < 2}
                variant="outline"
                onClick={async () => {
                  await router.push(
                    `/quotes/compare?ids=${checkedQuotes.join(",")}`
                  );
                }}
              >
                <Icons.sparkles className="mr-2 h-4 w-4" />
                Compare Quotes
              </Button>
            </span>
          </TooltipTrigger>
          {checkedQuotes.length < 2 && (
            <TooltipContent>
              <p>Select at least two quotes.</p>
            </TooltipContent>
          )}
        </Tooltip>
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
