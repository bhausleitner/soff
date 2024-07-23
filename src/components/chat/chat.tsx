import React, { type Dispatch, type SetStateAction } from "react";
import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { type Supplier } from "~/server/api/routers/supplier";
import { type ChatMessage } from "~/server/api/routers/chat";

interface ChatProps {
  supplier: Supplier;
  chatMessages: ChatMessage[];
  setChatMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  chatId: number;
  chatParticipantUserId: number;
}

export function Chat({
  supplier,
  chatMessages,
  setChatMessages,
  chatId,
  chatParticipantUserId
}: ChatProps) {
  function updateFrontendMessages(newMessage: ChatMessage) {
    setChatMessages([...chatMessages, newMessage]);
  }

  return (
    <>
      <ChatTopbar supplier={supplier} />
      <ChatList
        chatMessages={chatMessages}
        chatParticipantUserId={chatParticipantUserId}
      />
      <ChatBottombar
        chatParticipantUserId={chatParticipantUserId}
        chatId={chatId}
        updateFrontendMessages={updateFrontendMessages}
      />
    </>
  );
}
