import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";
import { useRouter } from "next/router";

interface CompareQuotesButtonProps {
  checkedQuotes: number[];
  rfqId?: number;
}

export default function CompareQuotesButton({
  checkedQuotes,
  rfqId
}: CompareQuotesButtonProps) {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            disabled={checkedQuotes.length < 2}
            variant="soff"
            onClick={async () => {
              await router.push(
                `/quotes/compare?ids=${checkedQuotes.join(",")}${
                  rfqId ? `&rfqId=${rfqId}` : ""
                }`
              );
            }}
          >
            Compare Quotes
            <Icons.sparkles className="ml-2 h-4 w-4" />
          </Button>
        </span>
      </TooltipTrigger>
      {checkedQuotes.length < 2 && (
        <TooltipContent>
          <p>Select at least two quotes.</p>
        </TooltipContent>
      )}
    </Tooltip>
  );
}
