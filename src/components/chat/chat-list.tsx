import React, { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarImage } from "../ui/avatar";
import { type Message, type UserData } from "~/static/data";
import { cn } from "~/lib/utils";

interface ChatListProps {
  messages?: Message[];
  selectedUser: UserData;
}

export function ChatList({ messages, selectedUser }: ChatListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div ref={messagesContainerRef} className="flex-grow overflow-x-hidden">
        <AnimatePresence>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: "spring",
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2
                }
              }}
              style={{
                originX: 0.5,
                originY: 0.5
              }}
              className={cn(
                "flex flex-col gap-2 whitespace-pre-wrap p-4",
                message.name !== selectedUser.name ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-3">
                {message.name === selectedUser.name && (
                  <Avatar className="flex items-center justify-center">
                    <AvatarImage
                      src={message.avatar}
                      alt={message.name}
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )}
                <span className="max-w-xs rounded-md bg-accent p-3">
                  {message.message}
                </span>
                {message.name !== selectedUser.name && (
                  <Avatar className="flex items-center justify-center">
                    <AvatarImage
                      src={message.avatar}
                      alt={message.name}
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
