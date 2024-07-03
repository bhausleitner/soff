import { SupplierTable } from "~/components/supplier-table";
import { ScrollArea } from "~/components/ui/scroll-area";

export default function Supplier() {
  return (
    <>
      <ScrollArea>
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Suppliers 🚛</h2>
          </div>
          <SupplierTable />
        </div>
      </ScrollArea>
    </>
  );
}
