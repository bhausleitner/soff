import { QuoteBreadcrumb } from "~/components/quote-detail/QuoteBreadcrumb";
import { GenericTable } from "~/components/common/GenericTable";
import { type Quote } from "~/server/api/routers/quote";
import { quoteTableConfig, useGetAllQuotes } from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";

export default function Supplier() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <QuoteBreadcrumb />
        {clerkUserId && (
          <GenericTable<Quote, { clerkUserId: string }>
            tableConfig={quoteTableConfig}
            useQueryHook={useGetAllQuotes}
            queryArgs={{ clerkUserId }}
          />
        )}
      </div>
    </>
  );
}
