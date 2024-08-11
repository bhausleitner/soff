import { useRouter } from "next/router";
import { Icons } from "~/components/icons";
import { Badge } from "~/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select";

interface QuoteHistoryProps {
  currentVersion: number;
  quoteHistory: {
    id: number;
    version: number;
    isActive: boolean;
  }[];
}

export function QuoteHistory({
  currentVersion,
  quoteHistory
}: QuoteHistoryProps) {
  const router = useRouter();

  return (
    <Select
      defaultValue={quoteHistory
        .find((item) => item.version === currentVersion)
        ?.version.toString()}
      onValueChange={async (value) => {
        const newQuoteId = quoteHistory.find(
          (item) => item.version === parseInt(value)
        )?.id;
        await router.push(`/quotes/${newQuoteId}`);
      }}
    >
      <SelectTrigger className="w-[200px] font-medium hover:bg-accent hover:text-accent-foreground">
        <div className="flex items-center gap-2">
          <Icons.history className="h-4 w-4" />
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent className="cursor-pointer">
        <SelectGroup>
          {quoteHistory
            .sort((a, b) => b.version - a.version)
            .map((item) => {
              return (
                <SelectItem
                  key={item.id}
                  value={item.version.toString()}
                  className="w-[400px] gap-2 hover:bg-accent hover:text-accent-foreground"
                >
                  <span>Version {item.version}</span>
                  {item.isActive && (
                    <Badge className="ml-2 bg-green-500 hover:bg-green-500">
                      Active
                    </Badge>
                  )}
                </SelectItem>
              );
            })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
