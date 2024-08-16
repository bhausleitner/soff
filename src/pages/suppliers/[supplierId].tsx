import { useRouter } from "next/router";
import React, { useState } from "react";
import { SupplierInfo } from "~/components/supplier-detail/SupplierInfo";
import { SupplierTabs } from "~/components/supplier-detail/SupplierTabs";
import { api } from "~/utils/api";
import Spinner from "~/components/spinner";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <BreadCrumbWrapper
          items={[
            { label: "Suppliers", href: "/suppliers" },
            { label: data.name, href: `/suppliers/${data.id}` }
          ]}
        />
        <div className="flex items-center">
          <Button
            className="w-32"
            variant="blue"
            onClick={async () => {
              setIsCreatingRFQ(true);

              const chatId = await createChat.mutateAsync({
                supplierId: data.id
              });

              await router.push(`/chat/${chatId}`);
              setIsCreatingRFQ(false);
            }}
            disabled={isCreatingRFQ}
          >
            {isCreatingRFQ ? (
              <Icons.loaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Start RFQ
                <Icons.sendHorizontal className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
      <SupplierInfo
        {...data}
        phone={data.phone as string | undefined}
        address={data.address as string | undefined}
      />
      <SupplierTabs supplierId={data.id} />
    </div>
  );
};

export default SupplierPage;
