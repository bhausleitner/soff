import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";
import { GenericTable } from "~/components/common/GenericTable";
import { SupplierModal } from "~/components/supplier/SupplierModal";
import { SupplierForm } from "~/components/supplier/SupplierForm";
import { type Supplier } from "~/server/api/routers/supplier";
import {
  supplierTableConfig,
  useGetAllSuppliers
} from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import { useState } from "react";

const handleSubmit = async () => {
  try {
    // To be implemented
  } catch (error) {
    // Handle error
  }
};

export default function Supplier() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SupplierBreadcrumb />
          <Button onClick={() => setIsModalOpen(true)} variant="blue">
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
      <SupplierModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SupplierForm onSubmit={handleSubmit} />
      </SupplierModal>
    </>
  );
}
