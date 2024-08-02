import { type Supplier } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type ChatMessage } from "~/server/api/routers/chat";
import { FileList } from "~/components/chat/file-list";

interface ChatMetadataProps {
  supplier: Supplier;
  messages: ChatMessage[];
  chatParticipantUserId: number;
}

export function ChatMetadata({
  supplier,
  messages,
  chatParticipantUserId
}: ChatMetadataProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto overflow-x-hidden">
      <div className="px-4">
        <Tabs defaultValue="sentFiles" className="w-full">
          <TabsList>
            <TabsTrigger value="receivedFiles">Received Files</TabsTrigger>
            <TabsTrigger value="sentFiles">Sent Files</TabsTrigger>
          </TabsList>
          <TabsContent value="receivedFiles">
            <FileList
              messages={messages}
              chatParticipantUserId={chatParticipantUserId}
              isUserMessage={false}
              supplierId={supplier.id}
            />
          </TabsContent>
          <TabsContent value="sentFiles">
            <FileList
              messages={messages}
              chatParticipantUserId={chatParticipantUserId}
              isUserMessage={true}
              supplierId={supplier.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
