import React from "react";
import { cn } from "~/lib/utils";
import { Icons } from "~/components/icons";
import { formatDate } from "~/utils/time";
import { type ChatMessage } from "~/server/api/routers/chat";
import { Attachment } from "~/components/chat/attachment";

interface MessageBubbleProps {
  chatMessage: ChatMessage;
  isUserMessage: boolean;
  supplierId: number;
}

export function MessageBubble({
  chatMessage,
  isUserMessage,
  supplierId
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md p-3",
        isUserMessage ? "bg-blue-100" : "bg-accent"
      )}
    >
      <span>{chatMessage.content}</span>
      <div className="mt-2 flex gap-2">
        {chatMessage.fileNames.map((fileName, index) => {
          return (
            <div key={index} className="mb-2">
              <Attachment
                key={index}
                fileKey={
                  !isUserMessage
                    ? `emailAttachments/${chatMessage.outlookMessageId}/${fileName}`
                    : `${fileName}`
                }
                isUserMessage={isUserMessage}
                supplierId={supplierId}
                chatId={chatMessage.chatId}
              />
            </div>
          );
        })}
      </div>
      <span className="mt-1 flex items-center gap-1 text-xs text-gray-600">
        <Icons.checkcheck className="h-4 w-4" />
        {formatDate(chatMessage.createdAt.toString())}
      </span>
    </div>
  );
}
