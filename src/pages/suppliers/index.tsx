import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";
import { GenericTable } from "~/components/common/GenericTable";
import { type Supplier } from "~/server/api/routers/supplier";
import {
  supplierTableConfig,
  useGetAllSuppliers
} from "~/constants/tableConfigs";
import { useUser } from "@clerk/nextjs";

export default function Supplier() {
  const user = useUser();
  const clerkUserId = user.user?.id;
  return (
    <>
      <div className="space-y-4">
        <SupplierBreadcrumb />
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
