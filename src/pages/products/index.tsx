import { GenericTable } from "~/components/common/GenericTable";
import { type ErpProduct } from "@prisma/client";
import {
  erpProductTableConfig,
  useGetAllErpProducts
} from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { useState } from "react";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { toast } from "sonner";
import { api } from "~/utils/api";

export default function Product() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  const [refetchToggle, setRefetchToggle] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);

  const syncErpProductsMutation = api.product.syncErpProducts.useMutation();

  const syncErpProducts = async () => {
    setIsSyncing(true);

    const syncProductsPromise = syncErpProductsMutation.mutateAsync();

    toast.promise(syncProductsPromise, {
      success: "Triggered sync of products. Can take up to 3 minutes.",
      error: "Failed syncing Products."
    });

    setIsSyncing(false);

    // refetch
    setRefetchToggle(!refetchToggle);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <BreadCrumbWrapper items={[{ label: "Products", href: "/products" }]} />
        <div className="flex items-center gap-2">
          <Button
            onClick={syncErpProducts}
            variant="outline"
            className="w-40"
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Sync Products
                <Icons.sync className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      {clerkUserId && (
        <GenericTable<ErpProduct, { clerkUserId: string }>
          tableConfig={erpProductTableConfig}
          useQueryHook={useGetAllErpProducts}
          queryArgs={{ clerkUserId }}
        />
      )}
    </div>
  );
}
