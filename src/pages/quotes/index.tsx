import { QuoteBreadcrumb } from "~/components/quote-detail/QuoteBreadcrumb";
import { GenericTable } from "~/components/common/GenericTable";
import { type Quote } from "~/server/api/routers/quote";
import { quoteTableConfig, useGetAllQuotes } from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";

export default function Supplier() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  return (
    <div className="space-y-4">
      <QuoteBreadcrumb />
      {clerkUserId && (
        <GenericTable<Quote, { clerkUserId: string }>
          tableConfig={quoteTableConfig}
          useQueryHook={useGetAllQuotes}
          queryArgs={{ clerkUserId }}
        />
      )}
    </div>
  );
}
