import { useRouter } from "next/router";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";

export function ViewChatButton({
  chatId,
  rfqId
}: {
  chatId: number;
  rfqId?: number;
}) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={async () =>
        await router.push(`/chat/${chatId}${rfqId ? `?rfqId=${rfqId}` : ""}`)
      }
    >
      <Icons.messageCircleMore className="mr-2 h-4 w-4" />
      View Chat
    </Button>
  );
}
