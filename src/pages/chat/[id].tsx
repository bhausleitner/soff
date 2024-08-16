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
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import ChatBottombar from "~/components/chat/chat-bottombar";
import ChatTopbar from "~/components/chat/chat-topbar";
import { ChatList } from "~/components/chat/chat-list";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";
import { EmailProvider } from "@prisma/client";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";

export default function Exchange() {
  const router = useRouter();
  const chatId = Number(router.query.id);
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
          <BreadCrumbWrapper
            items={[
              { label: "Suppliers", href: "/suppliers" },
              { label: supplier.name, href: `/suppliers/${supplier.id}` },
              { label: `Chat #${chatId}`, href: `/chat/${chatId}` }
            ]}
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
                <Icons.quotes className="mr-2 h-4 w-4" />
                View Quote
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
