import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { find, get } from "lodash";
import { SupplierBreadcrumb } from "~/components/supplier-detail/SupplierBreadcrumb";
import { type ChatMessage } from "~/server/api/routers/chat";
import Spinner from "~/components/spinner";
import { ChatMetadata } from "~/components/chat/chat-metadata";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "~/components/ui/resizable";
import { Button, buttonVariants } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import ChatBottombar from "~/components/chat/chat-bottombar";
import ChatTopbar from "~/components/chat/chat-topbar";
import { ChatList } from "~/components/chat/chat-list";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";
import Link from "next/link";
import { cn } from "~/lib/utils";

export default function Exchange() {
  const router = useRouter();
  const chatId = Number(router.query.id);
  const { data } = api.chat.getChat.useQuery({
    chatId: chatId
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    data?.newChat?.messages ?? []
  );

  useEffect(() => {
    if (data?.newChat?.messages) {
      setChatMessages(data.newChat.messages);
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

  console.log(data?.newChat?.quotes);

  return (
    <div className="flex h-full flex-col pb-7">
      <div className="pb-4">
        <div className="flex items-center justify-between">
          <SupplierBreadcrumb
            name={supplier.name}
            supplierId={supplier.id}
            rfq={true}
            chatId={chatId}
          />
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="outline"
                disabled={
                  !data?.newChat?.quotes || data?.newChat?.quotes.length === 0
                }
                onClick={async () => {
                  const quote = data?.newChat?.quotes[0];
                  if (quote) {
                    await router.push(`/quotes/${quote.id}`);
                  }
                }}
              >
                View Quote
                <Icons.quotes className="ml-2 h-4 w-4" />
              </Button>
            </TooltipTrigger>
            {(!data?.newChat?.quotes || data?.newChat?.quotes.length === 0) && (
              <TooltipContent>
                <p>No quote parsed yet.</p>
              </TooltipContent>
            )}
          </Tooltip>
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
              chatParticipantUserId={chatParticipantUserId}
              updateFrontendMessages={updateFrontendMessages}
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
