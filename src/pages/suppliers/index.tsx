import { SupplierTable } from "~/components/supplier-table/SupplierTable";
import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";

export default function Supplier() {
  return (
    <>
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <SupplierBreadcrumb />
        <SupplierTable />
      </div>
    </>
  );
}
