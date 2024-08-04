import React, { useEffect, useRef, useState } from "react";
import { Icons } from "~/components/icons";
import { api } from "~/utils/api";
import { getCurrentDateTime } from "~/utils/time";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { EmojiPicker } from "~/components/chat/emoji-picker";
import { type ChatMessage } from "~/server/api/routers/chat";
import { toast } from "sonner";
import { FileBadge } from "~/components/chat/file-badge";
import { v4 as uuidv4 } from "uuid";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";

interface ChatBottombarProps {
  chatParticipantUserId: number;
  chatId: number;
  updateFrontendMessages: (newMessage: ChatMessage) => void;
}

interface FileWithHash extends File {
  hash: string;
  uploaded?: boolean; // New property to track upload status
}

export default function ChatBottombar({
  updateFrontendMessages,
  chatId,
  chatParticipantUserId
}: ChatBottombarProps) {
  const [textContent, setTextContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [files, setFiles] = useState<FileWithHash[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const generateUploadUrls = api.s3.generateUploadUrls.useMutation();
  const deleteFile = api.s3.deleteFile.useMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const filesWithHashes: FileWithHash[] = Array.from(selectedFiles).map(
        (file) => {
          return Object.assign(file, { hash: uuidv4(), uploaded: false });
        }
      );
      setFiles(filesWithHashes);
    }
  };

  useEffect(() => {
    const filesToUpload = files.filter((file) => !file.uploaded);
    if (filesToUpload.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      handleFileUpload(filesToUpload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileRemove = async (fileName: string) => {
    const file = files.find((file) => file.name === fileName);
    if (file) {
      try {
        await deleteFile.mutateAsync({
          fileKey: `outgoingEmailAttachments/${file.hash}/${file.name}`
        });
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.name !== fileName)
        );
      } catch (error) {
        console.error("Failed to delete file:", error);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(event.target.value);
  };

  const handleFileUpload = async (filesToUpload: FileWithHash[]) => {
    if (!filesToUpload.length) return;

    setUploading(true);

    const fileData = filesToUpload.map((file) => ({
      fileKey: `outgoingEmailAttachments/${file.hash}/${file.name}`,
      fileType: file.type
    }));

    // Request signed URLs for all files
    const response = await generateUploadUrls.mutateAsync(fileData);

    await Promise.all(
      filesToUpload.map((file, index) => {
        const uploadUrl = response.uploadUrls[index];
        if (uploadUrl) {
          return fetch(uploadUrl, {
            method: "PUT",
            headers: {
              "Content-Type": file.type
            },
            body: file
          });
        }
      })
    );

    setFiles((prevFiles) =>
      prevFiles.map((file) => Object.assign(file, { uploaded: true }))
    );

    setUploading(false);
  };

  const sendMessage = api.chat.sendEmail.useMutation();

  const handleSend = async (emoji?: string) => {
    setIsSending(true);
    const messageContent = emoji ?? textContent;
    if (messageContent.trim()) {
      const newChatMessage: ChatMessage = {
        id: textContent.length + 1,
        chatId: chatId,
        content: messageContent,
        chatParticipantId: chatParticipantUserId,
        fileNames: files
          .filter((file) => file.uploaded)
          .map((file) => `outgoingEmailAttachments/${file.hash}/${file.name}`),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        const sendMessagePromise = sendMessage.mutateAsync(newChatMessage);

        toast.promise(sendMessagePromise, {
          loading: "Sending E-Mail...",
          success: "E-Mail sent!",
          error: "Failed sending E-Mail. Please try again.",
          description: getCurrentDateTime()
        });

        await sendMessagePromise;

        setIsSending(false);

        // clear input field
        setTextContent("");

        // append to the current frontend chat messages
        updateFrontendMessages(newChatMessage);

        // return focus to main window
        if (inputRef.current) {
          inputRef.current.focus();
        }

        // Clear files after message is sent
        setFiles([]);
      } catch (err) {
        setIsSending(false);
        console.error("Caught the error", err);
      }
    }
  };

  const handleKeyPress = async (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await handleSend();
    }

    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setTextContent((prev) => prev + "\n");
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex flex-col items-center">
        <Link
          href="#"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-9 w-9",
            "shrink-0 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
          )}
          onClick={handleIconClick}
        >
          <Icons.paperClip size={20} className="text-muted-foreground" />
        </Link>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <AnimatePresence initial={false}>
        {files.map((file, index) => {
          return (
            <FileBadge
              key={index}
              fileName={file.name}
              handleRemove={() => handleFileRemove(file.name)}
              uploading={uploading}
            />
          );
        })}
        <motion.div
          key="input"
          className="relative w-full"
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.05 },
            layout: {
              type: "spring",
              bounce: 0.15
            }
          }}
        >
          <Textarea
            autoComplete="off"
            value={textContent}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="textContent"
            placeholder="Aa"
            className="flex h-9 w-full resize-none items-center overflow-hidden rounded-full border bg-background"
          ></Textarea>

          <div className="absolute bottom-0.5 right-2">
            <EmojiPicker
              onChange={(value) => {
                setTextContent(textContent + value);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />
          </div>
        </motion.div>

        {isSending ? (
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "shrink-0 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
            )}
          >
            <Icons.loaderCircle
              size={20}
              className="animate-spin text-muted-foreground"
            />
          </Link>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              {textContent.trim() ? (
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    uploading && "cursor-not-allowed opacity-50",
                    "h-9 w-9",
                    "shrink-0 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                  onClick={async () => await handleSend()}
                >
                  <Icons.sendHorizontal
                    size={20}
                    className="text-muted-foreground"
                  />
                </Link>
              ) : (
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    uploading && "cursor-not-allowed opacity-50",
                    "h-9 w-9",
                    "shrink-0 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                  onClick={async () => {
                    await handleSend("👍");
                  }}
                >
                  <Icons.thumbsUp size={20} className="text-muted-foreground" />
                </Link>
              )}
            </TooltipTrigger>
            <TooltipContent>
              {uploading ? <p>Uploading files...</p> : <p>Click to send.</p>}
            </TooltipContent>
          </Tooltip>
        )}
      </AnimatePresence>
    </div>
  );
}
