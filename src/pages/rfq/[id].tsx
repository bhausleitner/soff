import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Chat } from "~/components/chat/chat";
import { api } from "~/utils/api";
import { find, get } from "lodash";
import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";
import { type ChatMessage } from "~/server/api/routers/chat";
import Spinner from "~/components/spinner";

export default function Exchange() {
  const router = useRouter();
  const chatId = Number(router.query.id);
  const { data } = api.chat.getChat.useQuery({
    chatId: chatId
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    data?.messages ?? []
  );

  useEffect(() => {
    if (data?.messages) {
      setChatMessages(data.messages);
    }
  }, [data]);

  const supplier = get(
    find(data?.chatParticipants, (item) => item.supplier !== null),
    "supplier"
  );

  if (!supplier) {
    return <Spinner />;
  }

  const chatParticipantUserId = get(
    find(data?.chatParticipants, (item) => item.user !== null),
    "id"
  );

  if (!chatParticipantUserId) {
    return <Spinner />;
  }

  return (
    <div className="flex h-full flex-col space-y-4 p-4 pt-6 md:p-8">
      <SupplierBreadcrumb
        name={supplier.name}
        supplierId={supplier.id}
        rfq={true}
        chatId={chatId}
      />
      <Chat
        supplier={supplier}
        chatMessages={chatMessages}
        setChatMessages={setChatMessages}
        chatId={chatId}
        chatParticipantUserId={chatParticipantUserId}
      />
    </div>
  );
}
