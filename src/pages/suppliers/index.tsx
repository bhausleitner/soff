import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";
import { GenericTable } from "~/components/common/GenericTable";
import { type Supplier } from "~/server/api/routers/supplier";
import {
  supplierTableConfig,
  useGetAllSuppliers
} from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { useState } from "react";

export default function Supplier() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  const [isOnboarding, setIsOnboarding] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SupplierBreadcrumb />
          <Button
            onClick={async () => {
              setIsOnboarding(true);
            }}
            variant="blue"
          >
            Supplier
            <Icons.add className="ml-2 h-4 w-4" />
          </Button>
        </div>
        {clerkUserId && (
          <GenericTable<Supplier, { clerkUserId: string }>
            tableConfig={supplierTableConfig}
            useQueryHook={useGetAllSuppliers}
            queryArgs={{ clerkUserId }}
          />
        )}
      </div>
    </>
  );
}
