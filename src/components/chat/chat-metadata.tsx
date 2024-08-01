import { type Supplier } from "@prisma/client";
import { Icons } from "~/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { type ChatMessage } from "~/server/api/routers/chat";
import { FileBadge } from "~/components/chat/file-badge";
import { useState } from "react";
import { useFileHandling } from "~/hooks/use-file-handling";
import { FilePreviewDialog } from "~/components/common/FilePreviewDialog";

interface ChatMetadataProps {
  supplier: Supplier;
  messages: ChatMessage[];
  chatParticipantUserId: number;
}

const getSentFiles = (
  messages: ChatMessage[],
  chatParticipantUserId: number
) => {
  return messages
    .filter((message) => message.chatParticipantId === chatParticipantUserId)
    .flatMap((message) => message.fileNames);
};

const getReceivedFiles = (
  messages: ChatMessage[],
  chatParticipantUserId: number
) => {
  return messages
    .filter((message) => message.chatParticipantId !== chatParticipantUserId)
    .flatMap((message) => message.fileNames);
};

export function ChatMetadata({
  supplier,
  messages,
  chatParticipantUserId
}: ChatMetadataProps) {
  const sentFiles = getSentFiles(messages, chatParticipantUserId);
  const receivedFiles = getReceivedFiles(messages, chatParticipantUserId);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const {
    isOpen,
    setIsOpen,
    isDownloading,
    handleDownload,
    handleOpen,
    handleClose
  } = useFileHandling();

  const renderFileList = (files: string[]) => (
    <ul className="space-y-2">
      {files.map((file, index) => {
        const fileName = file.split("/").pop() ?? "Unnamed File";
        return (
          <li key={index}>
            <FileBadge
              fileName={fileName}
              handleOpen={() => {
                setCurrentFile(file);
                handleOpen();
              }}
              handleDownload={() => handleDownload(file)}
            />
          </li>
        );
      })}
    </ul>
  );

  return (
    <div>
      <div className="border-b pb-4">
        <div className="pl-4">
          <h3 className="mb-4 text-xl font-semibold">{supplier.name}</h3>
          <div className="mb-2 flex items-center">
            <Icons.mapPin className="mr-2 text-gray-600" />
            <span className="text-gray-800">{supplier.contactPerson}</span>
          </div>
          <div className="flex items-center">
            <Icons.phone className="text-gray-6000 mr-2" />
            <span className="text-gray-800">{supplier.email}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <Tabs defaultValue="sentFiles" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="sentFiles">Sent Files</TabsTrigger>
            <TabsTrigger value="receivedFiles">Received Files</TabsTrigger>
          </TabsList>
          <TabsContent value="sentFiles">
            {renderFileList(sentFiles)}
          </TabsContent>
          <TabsContent value="receivedFiles">
            {renderFileList(receivedFiles)}
          </TabsContent>
        </Tabs>
      </div>
      <FilePreviewDialog
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        fileKey={currentFile}
        isDownloading={isDownloading}
        handleDownload={handleDownload}
        handleClose={handleClose}
      />
    </div>
  );
}
