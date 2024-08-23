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
  variant?: "outline" | "default" | "soff";
}

export default function CompareQuotesButton({
  checkedQuotes,
  rfqId,
  variant = "soff"
}: CompareQuotesButtonProps) {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <Button
            disabled={checkedQuotes.length < 2}
            variant={variant}
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
