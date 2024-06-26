import React from "react";
import { type Message, type UserData } from "~/static/data";
import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import ChatBottombar from "./chat-bottombar";

interface ChatProps {
  messages?: Message[];
  selectedUser: UserData;
}

export function Chat({ messages, selectedUser }: ChatProps) {
  const [messagesState, setMessages] = React.useState<Message[]>(
    messages ?? []
  );

  const sendMessage = (newMessage: Message) => {
    setMessages([...messagesState, newMessage]);
  };

  return (
    <>
      <ChatTopbar selectedUser={selectedUser} />
      <ChatList messages={messagesState} selectedUser={selectedUser} />
      <ChatBottombar sendMessage={sendMessage} />
    </>
  );
}
