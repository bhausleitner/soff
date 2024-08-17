import { useUser } from "@clerk/nextjs";
import { type RequestForQuote } from "@prisma/client";
import React, { useState } from "react";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { GenericTable } from "~/components/common/GenericTable";
import { Icons } from "~/components/icons";
import RFQFormDialog from "~/components/rfq/rfq-form";
import { Button } from "~/components/ui/button";
import {
  rfqTableConfig,
  useGetAllRequestsForQuotes
} from "~/constants/tableConfigs";

export default function Rfqs() {
  const user = useUser();
  const clerkUserId = user.user?.id;

  const [rfqDialogOpen, setRfqDialogOpen] = useState<boolean>(false);
  const [refetchToggle, setRefetchToggle] = useState(false);

  const toggleRefetch = () => {
    console.log("jaiiii");
    console.log("jaiiii");
    console.log("jaiiii");
    console.log("jaiiii");
    setRefetchToggle(!refetchToggle);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <BreadCrumbWrapper
          items={[
            {
              label: "RFQs",
              href: "/rfqs"
            }
          ]}
        />
        <Button variant="soff" onClick={() => setRfqDialogOpen(true)}>
          Create New RFQ
          <Icons.packagePlus className="ml-2 h-4 w-4" />
        </Button>
        <RFQFormDialog
          open={rfqDialogOpen}
          setOpen={setRfqDialogOpen}
          clerkUserId={clerkUserId!}
          refetchTrigger={() => toggleRefetch()}
        />
      </div>
      <GenericTable<RequestForQuote, { clerkUserId: string }>
        tableConfig={rfqTableConfig}
        useQueryHook={useGetAllRequestsForQuotes}
        queryArgs={{ clerkUserId: clerkUserId! }}
        refetchTrigger={refetchToggle}
      />
    </div>
  );
}
