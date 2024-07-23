import { QuoteBreadcrumb } from "~/components/quote-table/QuoteBreadcrumb";
import { GenericTable } from "~/components/common/GenericTable";
import { type Quote } from "~/server/api/routers/supplier";
import { quoteTableConfig, useGetAllQuotes } from "~/constants/tableConfigs";

export default function Supplier() {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <QuoteBreadcrumb quoteId={1} />
        <GenericTable<Quote>
          tableConfig={quoteTableConfig}
          useQueryHook={useGetAllQuotes}
        />
      </div>
    </>
  );
}
