import React from "react";
import { cn } from "~/lib/utils";
import { Avatar, AvatarImage } from "../ui/avatar";
import { type ChatMessage } from "~/server/api/routers/chat";
import { map } from "lodash";
import { Icons } from "~/components/icons";

interface ChatListProps {
  chatMessages?: ChatMessage[];
  chatParticipantUserId: number;
}

export function ChatList({
  chatMessages,
  chatParticipantUserId
}: ChatListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    };
    return date.toLocaleDateString("en-GB", options);
  };

  // render message left side if chatparticipant is not the user
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="flex-grow overflow-x-hidden">
        {map(chatMessages, (chatMessage, index) => (
          <div
            key={index}
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
          </div>
        ))}
      </div>
    </div>
  );
}
