import React, { useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import { type ChatMessage } from "~/server/api/routers/chat";
import { map, orderBy } from "lodash";
import { AnimatePresence, motion } from "framer-motion";
import { MessageBubble } from "~/components/chat/message-bubble";

interface ChatListProps {
  chatMessages?: ChatMessage[];
  chatParticipantUserId: number;
  supplierId: number;
}

export function ChatList({
  chatMessages = [],
  chatParticipantUserId,
  supplierId
}: ChatListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const lastMessage = lastMessageRef.current;

      const scrollOptions: ScrollIntoViewOptions = {
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      };

      setTimeout(() => {
        lastMessage.scrollIntoView(scrollOptions);

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const maxScrollTop = scrollHeight - clientHeight;

        if (scrollTop > maxScrollTop) {
          container.scrollTop = maxScrollTop;
        }
      }, 100);
    }
  }, [chatMessages]);

  const sortedMessages = orderBy(chatMessages, ["createdAt"], ["asc"]);

  return (
    <div
      className={"h-full overflow-y-auto overflow-x-hidden"}
      ref={messagesContainerRef}
    >
      <div className="min-h-full w-full px-4">
        <AnimatePresence>
          {map(sortedMessages, (chatMessage, index) => {
            const isLastMessage = index === chatMessages.length - 1;
            return (
              <motion.div
                key={index}
                ref={isLastMessage ? lastMessageRef : null}
                layout
                initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                transition={{
                  opacity: { duration: 0.1 },
                  layout: {
                    type: "spring",
                    bounce: 0.3,
                    duration: chatMessages.indexOf(chatMessage) * 0.05 + 0.2
                  }
                }}
                style={{
                  originX: 0.5,
                  originY: 0.5
                }}
                className={cn(
                  "flex flex-col gap-2 whitespace-pre-wrap py-2", // Changed p-4 to py-2
                  chatMessage.chatParticipantId === chatParticipantUserId
                    ? "items-end"
                    : "items-start"
                )}
              >
                <MessageBubble
                  chatMessage={chatMessage}
                  isUserMessage={
                    chatMessage.chatParticipantId === chatParticipantUserId
                  }
                  supplierId={supplierId}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
