import { type ChatMessage } from "~/server/api/routers/chat";
import { Icons } from "~/components/icons";
import { formatDate } from "~/utils/time";
import { Attachment } from "~/components/chat/attachment";

interface FileListProps {
  messages: ChatMessage[];
  chatParticipantUserId: number;
  isUserMessage: boolean;
  supplierId: number;
}

export function FileList({
  messages,
  chatParticipantUserId,
  isUserMessage,
  supplierId
}: FileListProps) {
  const filteredMessages = messages.filter((message) => {
    // only consider messages that have files
    if (isUserMessage && message.fileNames.length > 0) {
      return message.chatParticipantId === chatParticipantUserId;
    } else if (!isUserMessage && message.fileNames.length > 0) {
      return message.chatParticipantId !== chatParticipantUserId;
    }
    return false;
  });
  return (
    <div className="p-2">
      {filteredMessages.map((message, index) => {
        return (
          <div key={index} className="mb-6">
            <div className="relative mb-2 flex items-start">
              <div className="flex items-center">
                <Icons.circle className="h-2 w-2 text-gray-300" />
                <span className="ml-2 text-sm text-gray-500">
                  {formatDate(message.createdAt.toString())}
                </span>
              </div>
            </div>
            <div className="ml-4 flex flex-wrap gap-2">
              {message.fileNames.map((fileName: string, index: number) => {
                return (
                  <div key={index} className="mb-2">
                    <Attachment
                      chatId={message.chatId}
                      fileKey={
                        !isUserMessage
                          ? `emailAttachments/${message.outlookMessageId}/${fileName}`
                          : `${fileName}`
                      }
                      isUserMessage={isUserMessage}
                      supplierId={supplierId}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {filteredMessages.length === 0 && (
        <div className="text-center text-gray-500">No files sent.</div>
      )}
    </div>
  );
}
