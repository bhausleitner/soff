import React, { useRef, useEffect } from "react";
import { cn } from "~/lib/utils";
import { type ChatMessage } from "~/server/api/routers/chat";
import { map } from "lodash";
import { Icons } from "~/components/icons";
import { formatDate } from "~/utils/time";
import { AnimatePresence, motion } from "framer-motion";

interface ChatListProps {
  chatMessages?: ChatMessage[];
  chatParticipantUserId: number;
}

export function ChatList({
  chatMessages = [],
  chatParticipantUserId
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
                <div
                  className={cn(
                    "flex flex-col rounded-md p-3",
                    chatMessage.chatParticipantId === chatParticipantUserId
                      ? "bg-blue-100"
                      : "bg-accent"
                  )}
                >
                  <span>{chatMessage.content}</span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-gray-600">
                    <Icons.checkcheck className="h-4 w-4" />
                    {formatDate(chatMessage.createdAt.toString())}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
