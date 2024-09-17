import { GenericTable } from "~/components/common/GenericTable";
import { SupplierModal } from "~/components/supplier/SupplierModal";
import { type Supplier } from "@prisma/client";
import {
  supplierTableConfig,
  useGetAllSuppliers
} from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { useState } from "react";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { type SupplierLineItem } from "~/server/api/routers/supplier";
import { api } from "~/utils/api";
import { toast } from "sonner";

export default function Supplier() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refetchToggle, setRefetchToggle] = useState(false);

  const [isSyncing, setIsSyncing] = useState(false);

  const syncSuppliersMutation = api.supplier.syncSuppliers.useMutation();

  const syncSuppliers = async () => {
    setIsSyncing(true);

    const syncSuppliersPromise = syncSuppliersMutation.mutateAsync();

    toast.promise(syncSuppliersPromise, {
      success: "Triggered sync of suppliers. Can take up to 3 minutes.",
      error: "Failed syncing Suppliers."
    });

    await syncSuppliersMutation.mutateAsync();

    setIsSyncing(false);

    // refetch
    toggleRefetch();
  };

  const toggleRefetch = () => {
    setRefetchToggle(!refetchToggle);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <BreadCrumbWrapper
            items={[{ label: "Suppliers", href: "/suppliers" }]}
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={syncSuppliers}
              variant="outline"
              className="w-40"
              disabled={isSyncing}
            >
              {isSyncing ? (
                <Icons.spinner className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sync Suppliers
                  <Icons.sync className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="blue"
              className="w-40"
            >
              Add Supplier
              <Icons.add className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
        {clerkUserId && (
          <GenericTable<SupplierLineItem, { clerkUserId: string }>
            tableConfig={supplierTableConfig}
            useQueryHook={useGetAllSuppliers}
            queryArgs={{ clerkUserId }}
            refetchTrigger={refetchToggle}
          />
        )}
      </div>
      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          // todo: handle the form submission here
          console.log(data);

          // triggers refetch of supplier table
          toggleRefetch();
        }}
      ></SupplierModal>
    </>
  );
}
