import { useUser } from "@clerk/nextjs";
import { type RequestForQuote } from "@prisma/client";
import { useRouter } from "next/router";
import React from "react";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { GenericTable } from "~/components/common/GenericTable";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  rfqTableConfig,
  useGetAllRequestsForQuotes
} from "~/constants/tableConfigs";

export default function Rfqs() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  const router = useRouter();

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
        <Button variant="soff" onClick={() => router.push("/rfqs/new")}>
          Create New RFQ
          <Icons.packagePlus className="ml-2 h-4 w-4" />
        </Button>
      </div>
      <GenericTable<RequestForQuote, { clerkUserId: string }>
        tableConfig={rfqTableConfig}
        useQueryHook={useGetAllRequestsForQuotes}
        queryArgs={{ clerkUserId: clerkUserId! }}
      />
    </div>
  );
}
