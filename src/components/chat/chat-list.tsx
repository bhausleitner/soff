import React, { useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import { type ChatMessage } from "~/server/api/routers/chat";
import { map } from "lodash";
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
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div ref={messagesContainerRef} className="flex-grow overflow-x-hidden">
        <AnimatePresence>
          {map(chatMessages, (chatMessage, index) => {
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
                  "flex flex-col gap-2 whitespace-pre-wrap p-4",
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
