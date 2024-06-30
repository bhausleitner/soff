import { useRouter } from "next/router";
import { ScrollArea } from "~/components/ui/scroll-area";
import { api } from "~/utils/api";

export default function Order() {
  const router = useRouter();
  const { id } = router.query;

  const supplierId = Number(id);

  if (isNaN(supplierId)) {
    // Todo show generic failure page
    return <div>Invalid Supplier ID</div>;
  }

  const { data, isLoading } = api.supplier.getSupplierById.useQuery({
    supplierId
  });

  return (
    <>
      <ScrollArea>
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Order</h2>
          </div>
          <div>
            <p>This is the Supplier Name: {data?.title}</p>
          </div>
        </div>
      </ScrollArea>
    </>
  );
}
