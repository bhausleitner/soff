import React, { useRef, useState } from "react";
import { Icons } from "~/components/icons";
import { api } from "~/utils/api";
import { getCurrentDateTime } from "~/utils/time";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "~/lib/utils";
import { buttonVariants } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { EmojiPicker } from "./emoji-picker";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { type ChatMessage } from "~/server/api/routers/chat";
import { toast } from "sonner";

interface ChatBottombarProps {
  chatParticipantUserId: number;
  chatId: number;
  updateFrontendMessages: (newMessage: ChatMessage) => void;
}

export const BottombarIcons = [
  { icon: Icons.fileImage },
  { icon: Icons.paperClip }
];

export default function ChatBottombar({
  updateFrontendMessages,
  chatId,
  chatParticipantUserId
}: ChatBottombarProps) {
  const [textContent, setTextContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextContent(event.target.value);
  };

  const sendChat = api.chat.sendChat.useMutation();

  const handleSend = async (emoji?: string) => {
    setIsSending(true);
    const messageContent = emoji ?? textContent;
    if (messageContent.trim()) {
      const newChatMessage: ChatMessage = {
        id: textContent.length + 1,
        chatId: chatId,
        content: messageContent,
        chatParticipantId: chatParticipantUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        const sendChatPromise = sendChat.mutateAsync(newChatMessage);

        toast.promise(sendChatPromise, {
          loading: "Sending E-Mail...",
          success: "E-Mail sent!",
          error: "Failed sending E-Mail. Please try again.",
          description: getCurrentDateTime()
        });

        await sendChatPromise;

        setIsSending(false);

        // clear input field
        setTextContent("");

        // append to the current frontend chat messages
        updateFrontendMessages(newChatMessage);

        // return focus to main window
        if (inputRef.current) {
          inputRef.current.focus();
        }
      } catch (err) {
        setIsSending(false);
        console.error("Catched the error", err);
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
    <div className="flex w-full items-center justify-between gap-2 p-2">
      <div className="flex">
        <Popover>
          <PopoverTrigger asChild>
            <Link
              href="#"
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9",
                "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
              )}
            >
              <Icons.plusCircle size={20} className="text-muted-foreground" />
            </Link>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-full p-2">
            {textContent.trim() ? (
              <div className="flex gap-2">
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <Icons.mic size={20} className="text-muted-foreground" />
                </Link>
                {BottombarIcons.map((icon, index) => (
                  <Link
                    key={index}
                    href="#"
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "icon" }),
                      "h-9 w-9",
                      "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                    )}
                  >
                    <icon.icon size={20} className="text-muted-foreground" />
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9",
                  "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                )}
              >
                <Icons.mic size={20} className="text-muted-foreground" />
              </Link>
            )}
          </PopoverContent>
        </Popover>
        {!textContent.trim() && (
          <div className="flex">
            {BottombarIcons.map((icon, index) => (
              <Link
                key={index}
                href="#"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "icon" }),
                  "h-9 w-9",
                  "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                )}
              >
                <icon.icon size={20} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
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
        ) : textContent.trim() ? (
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "shrink-0 dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
            )}
            onClick={async () => await handleSend()}
          >
            <Icons.sendHorizontal size={20} className="text-muted-foreground" />
          </Link>
        ) : (
          <Link
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
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
      </AnimatePresence>
    </div>
  );
}
