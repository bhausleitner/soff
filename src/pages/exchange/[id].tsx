import { useState } from "react";
import { useRouter } from "next/router";
import { userData } from "~/static/data";
import { Chat } from "~/components/chat/chat";
import { api } from "~/utils/api";
import { find } from "lodash";
import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";

export default function Exchange() {
  const router = useRouter();
  const chatId = Number(router.query.id);
  const { data } = api.chat.getChat.useQuery({
    chatId: chatId
  });

  const supplier = find(
    data?.chatParticipants,
    (item) => item.supplier !== null
  )?.supplier;

  if (!supplier) {
    return <div>No supplier found</div>;
  }

  return (
    <div className="flex h-full flex-col space-y-4 p-4 pt-6 md:p-8">
      <SupplierBreadcrumb
        name={supplier.name}
        supplierId={supplier.id}
        rfq={true}
        chatId={chatId}
      />
      <Chat supplier={supplier} />
    </div>
  );
}
