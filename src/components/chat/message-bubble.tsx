import React from "react";
import { cn } from "~/lib/utils";
import { Icons } from "~/components/icons";
import { formatDate } from "~/utils/time";
import { type ChatMessage } from "~/server/api/routers/chat";
import { Attachment } from "~/components/chat/attachment";

interface MessageBubbleProps {
  chatMessage: ChatMessage;
  isUserMessage: boolean;
}

export function MessageBubble({
  chatMessage,
  isUserMessage
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md p-3",
        isUserMessage ? "bg-blue-100" : "bg-accent"
      )}
    >
      <span>{chatMessage.content}</span>
      {chatMessage.hasAttachments && (
        <Attachment
          fileKey={`emailAttachments/${chatMessage.outlookMessageId}/DARPA-SN-24-68.pdf`}
          fileName={"file_attach.pdf"}
        />
      )}
      <span className="mt-1 flex items-center gap-1 text-xs text-gray-600">
        <Icons.checkcheck className="h-4 w-4" />
        {formatDate(chatMessage.createdAt.toString())}
      </span>
    </div>
  );
}
