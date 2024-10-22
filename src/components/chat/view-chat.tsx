import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "~/components/ui/sheet";
import ChatSheetContent from "~/components/chat/chat-sheet";

export function ViewChatButton({
  chatId,
  subject
}: {
  chatId: number;
  subject: string;
  rfqId?: number;
}) {
  const [refetchChatToggle, setRefetchChatToggle] = useState(false);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <Icons.messageCircleMore className="mr-2 h-4 w-4" />
          View Chat
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="!w-[70vw] !max-w-[95vw]">
        <SheetHeader className="flex flex-row gap-4">
          <div>
            <SheetTitle>{subject}</SheetTitle>
            <SheetDescription>Chat #{chatId}</SheetDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => setRefetchChatToggle(!refetchChatToggle)}
          >
            <Icons.refresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </SheetHeader>
        <div className="mt-4 h-[calc(100vh-100px)]">
          <ChatSheetContent
            chatId={chatId}
            refetchChatToggle={refetchChatToggle}
            resetRefetch={() => setRefetchChatToggle(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
