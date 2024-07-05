import React, { useState } from "react";
import { type Message, type UserData } from "~/static/data";
import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { api } from "~/utils/api";

interface ChatProps {
  messages?: Message[];
  selectedUser: UserData;
}

export function Chat({ messages, selectedUser }: ChatProps) {
  const [messagesState, setMessages] = useState<Message[]>(
    messages ?? []
  );
  const [ isSending, setIsSending ] = useState<boolean>(false);

  // Initialize Mutation
  const sendChat = api.chat.sendChat.useMutation();

  const sendMessage = async (newMessage: Message) => {
    setIsSending(true);
    setMessages([...messagesState, newMessage]);
    await sendChat.mutateAsync(newMessage)
    setIsSending(false);
  };

  return (
    <>
      <ChatTopbar selectedUser={selectedUser} />
      <ChatList messages={messagesState} selectedUser={selectedUser} isSending={isSending} />
      <ChatBottombar sendMessage={sendMessage} />
    </>
  );
}
