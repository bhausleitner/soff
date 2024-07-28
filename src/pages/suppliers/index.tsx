import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";
import { GenericTable } from "~/components/common/GenericTable";
import { type Supplier } from "~/server/api/routers/supplier";
import {
  supplierTableConfig,
  useGetAllSuppliers
} from "~/constants/tableConfigs";

export default function Supplier() {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <SupplierBreadcrumb />
        <GenericTable<Supplier, void>
          tableConfig={supplierTableConfig}
          useQueryHook={useGetAllSuppliers}
          queryArgs={undefined}
        />
      </div>
    </>
  );
}
