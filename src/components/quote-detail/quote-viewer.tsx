import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";
import { Icons } from "~/components/icons";
import { useRouter } from "next/router";

interface ViewQuoteButtonProps {
  quoteId?: number;
  rfqId?: number;
}

export function ViewQuoteButton({ quoteId, rfqId }: ViewQuoteButtonProps) {
  const router = useRouter();

  const handleClick = async () => {
    if (quoteId) {
      await router.push(`/quotes/${quoteId}${rfqId ? `?rfqId=${rfqId}` : ""}`);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="outline" disabled={!quoteId} onClick={handleClick}>
          <Icons.quotes className="mr-2 h-4 w-4" />
          View Quote
        </Button>
      </TooltipTrigger>
      {!quoteId && (
        <TooltipContent>
          <p>No quote parsed yet.</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
