import { useRouter } from "next/router";
import React, { useState } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { SupplierInfo } from "~/components/supplier-detail/SupplierInfo";
import { SupplierTabs } from "~/components/supplier-detail/SupplierTabs";
import { api } from "~/utils/api";
import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";
import Spinner from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { PaperPlaneIcon } from "@radix-ui/react-icons";

const SupplierPage = () => {
  const router = useRouter();
  const supplierId = parseInt(router.query.supplierId as string, 10);
  const [isCreatingRFQ, setIsCreatingRFQ] = useState(false);

  const createChat = api.chat.createChat.useMutation();

  if (isNaN(supplierId)) {
    return <Spinner />;
  }

  const { data, isLoading, error } = api.supplier.getSupplierById.useQuery({
    supplierId
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>No supplier found.</p>;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <SupplierBreadcrumb name={data.name} />
        <div className="flex items-center">
          <Button
            className="w-32"
            onClick={async () => {
              setIsCreatingRFQ(true);

              const chatId = await createChat.mutateAsync({
                supplierId: data.id
              });

              await router.push(`/rfq/${chatId}`);
              setIsCreatingRFQ(false);
            }}
            disabled={isCreatingRFQ}
          >
            {isCreatingRFQ ? (
              <ReloadIcon className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Start RFQ
                <PaperPlaneIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      <SupplierInfo data={data} />
      <SupplierTabs supplierId={data.id} />
    </div>
  );
};

export default SupplierPage;
