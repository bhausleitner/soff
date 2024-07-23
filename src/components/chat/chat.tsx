import React from "react";
import { type Message, type UserData } from "~/static/data";
import ChatTopbar from "./chat-topbar";
import { ChatList } from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { api } from "~/utils/api";
import { toast } from "sonner";
import { getCurrentDateTime } from "~/utils/time";
import { ensureError } from "~/utils/errorHandling";
import { type Supplier } from "~/server/api/routers/supplier";
import { type ChatMessage } from "~/server/api/routers/chat";

interface ChatProps {
  supplier: Supplier;
  chatMessages: ChatMessage[];
  chatParticipantUserId: number;
}

export function Chat({
  supplier,
  chatMessages,
  chatParticipantUserId
}: ChatProps) {
  return (
    <>
      <ChatTopbar supplier={supplier} />
      <ChatList
        chatMessages={chatMessages}
        chatParticipantUserId={chatParticipantUserId}
      />
      {/* <ChatBottombar sendMessage={sendMessage} /> */}
    </>
  );
}

// function handleSendChat({
//   setMessages,
//   messagesState,
//   supplier
// }: {
//   setMessages: any;
//   messagesState: any;
//   supplier: any;
// }) {
//   // Initialize Mutation
//   const sendChat = api.chat.sendChat.useMutation();

//   const sendMessage = async (newMessage: Message) => {
//     setMessages([...messagesState, newMessage]);

//     try {
//       const sendChatPromise = sendChat.mutateAsync({
//         message: newMessage.message,
//         supplierId: supplier.id
//       });

//       toast.promise(sendChatPromise, {
//         loading: "Sending E-Mail...",
//         success: "E-Mail sent!",
//         error: "Failed sending E-Mail. Please try again.",
//         description: getCurrentDateTime()
//       });

//       await sendChatPromise;
//     } catch (err) {
//       const error = ensureError(err);
//       console.error("Catched the error", error);
//     }
//   };
// }
