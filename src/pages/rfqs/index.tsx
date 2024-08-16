import { useUser } from "@clerk/nextjs";
import { type Supplier } from "@prisma/client";
import React from "react";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { GenericTable } from "~/components/common/GenericTable";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  supplierTableConfig,
  useGetAllSuppliers
} from "~/constants/tableConfigs";

export default function Rfqs() {
  const user = useUser();
  const clerkUserId = user.user?.id;
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
        <Button variant="blue">
          New RFQ
          <Icons.packagePlus className="ml-2 h-5 w-5" />
        </Button>
      </div>
      {/* {clerkUserId && (
        <GenericTable<Supplier, { clerkUserId: string }>
          tableConfig={supplierTableConfig}
          useQueryHook={useGetAllSuppliers}
          queryArgs={{ clerkUserId }}
        />
      )} */}
    </div>
  );
}
