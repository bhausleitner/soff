import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { find, get } from "lodash";
import { type ChatMessage } from "~/server/api/routers/chat";
import Spinner from "~/components/spinner";
import { ChatMetadata } from "~/components/chat/chat-metadata";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "~/components/ui/resizable";
import ChatBottombar from "~/components/chat/chat-bottombar";
import ChatTopbar from "~/components/chat/chat-topbar";
import { ChatList } from "~/components/chat/chat-list";
import { EmailProvider } from "@prisma/client";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";
import { ViewQuoteButton } from "~/components/quote-detail/quote-viewer";

export default function Exchange() {
  const router = useRouter();
  const chatId = Number(router.query.id);
  const rfqId = Number(router.query.rfqId);
  const { data } = api.chat.getChat.useQuery({
    chatId: chatId
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    data?.newChat?.messages ?? []
  );

  const [emailProvider, setEmailProvider] = useState<EmailProvider>(
    data?.emailProvider ?? EmailProvider.GMAIL
  );

  useEffect(() => {
    if (data?.newChat?.messages) {
      setChatMessages(data.newChat.messages);
    }
    if (data?.emailProvider) {
      setEmailProvider(data.emailProvider);
    }
  }, [data]);

  function updateFrontendMessages(newMessage: ChatMessage) {
    setChatMessages([...chatMessages, newMessage]);
  }

  const supplier = get(
    find(data?.newChat?.chatParticipants, (item) => item.supplier !== null),
    "supplier"
  );

  if (!supplier) {
    return <Spinner />;
  }

  const chatParticipantUserId = get(
    find(data?.newChat?.chatParticipants, (item) => item.user !== null),
    "id"
  );

  if (!chatParticipantUserId) {
    return <Spinner />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="pb-4">
        <div className="flex items-center justify-between">
          {!rfqId && (
            <BreadCrumbWrapper
              items={[
                { label: "Suppliers", href: "/suppliers" },
                { label: supplier.name, href: `/suppliers/${supplier.id}` },
                { label: `Chat #${chatId}`, href: `/chat/${chatId}` }
              ]}
            />
          )}
          {!isNaN(rfqId) && (
            <BreadCrumbWrapper
              items={[
                { label: "RFQs", href: "/rfqs" },
                { label: `RFQ #${rfqId}`, href: `/rfqs/${rfqId}` },
                { label: `Chat #${chatId}`, href: `/chat/${chatId}` }
              ]}
            />
          )}
          <ViewQuoteButton
            quoteId={data?.newChat?.quotes?.[0]?.id}
            rfqId={rfqId}
          />
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel
            defaultSize={70}
            minSize={50}
            className="flex flex-col"
          >
            <ChatTopbar supplier={supplier} />
            <div className="flex-grow overflow-hidden">
              <ChatList
                supplierId={supplier.id}
                chatMessages={chatMessages}
                chatParticipantUserId={chatParticipantUserId}
              />
            </div>
            <ChatBottombar
              chatId={chatId}
              chatSubject={data?.newChat?.subject ?? ""}
              chatParticipantUserId={chatParticipantUserId}
              updateFrontendMessages={updateFrontendMessages}
              emailProvider={emailProvider}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={30}
            minSize={20}
            className="overflow-hidden"
          >
            <ChatMetadata
              supplier={supplier}
              chatParticipantUserId={chatParticipantUserId}
              messages={chatMessages}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
