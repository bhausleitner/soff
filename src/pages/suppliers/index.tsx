import { GenericTable } from "~/components/common/GenericTable";
import { SupplierModal } from "~/components/supplier/SupplierModal";
import { type Supplier } from "~/server/api/routers/supplier";
import {
  supplierTableConfig,
  useGetAllSuppliers
} from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { useState } from "react";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";

export default function Supplier() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refetchToggle, setRefetchToggle] = useState(false);

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
          <Button onClick={() => setIsModalOpen(true)} variant="blue">
            Add Supplier
            <Icons.add className="ml-2 h-5 w-5" />
          </Button>
        </div>
        {clerkUserId && (
          <GenericTable<Supplier, { clerkUserId: string }>
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
          // Handle the form submission here
          console.log(data);

          // triggers refetch of supplier table
          toggleRefetch();
        }}
      ></SupplierModal>
    </>
  );
}
