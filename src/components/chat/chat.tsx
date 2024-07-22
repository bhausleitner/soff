import React, { useState } from "react";
import { type Message, type UserData } from "~/static/data";
import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { getCurrentDateTime } from "~/utils/time";
import { ensureError } from "~/utils/errorHandling";

interface ChatProps {
  messages?: Message[];
  selectedUser: UserData;
  supplierId: number;
}

export function Chat({ messages, selectedUser, supplierId }: ChatProps) {
  const [messagesState, setMessages] = useState<Message[]>(messages ?? []);

  // Initialize Mutation
  const sendChat = api.chat.sendChat.useMutation();

  const sendMessage = async (newMessage: Message) => {
    setMessages([...messagesState, newMessage]);

    try {
      const sendChatPromise = sendChat.mutateAsync({
        message: newMessage.message,
        supplierId: supplierId
      });

      toast.promise(sendChatPromise, {
        loading: "Sending E-Mail...",
        success: "E-Mail sent!",
        error: "Failed sending E-Mail. Please try again.",
        description: getCurrentDateTime()
      });

      await sendChatPromise;
    } catch (err) {
      const error = ensureError(err);
      console.error("Catched the error", error);
    }
  };

  return (
    <>
      <ChatTopbar selectedUser={selectedUser} />
      <ChatList messages={messagesState} selectedUser={selectedUser} />
      <ChatBottombar sendMessage={sendMessage} />
    </>
  );
}
