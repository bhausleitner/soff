import { Badge } from "~/components/ui/badge";
import { Icons } from "~/components/icons";
import { cn } from "~/lib/utils";

export function DiffBadge({ number }: { number: number }) {
  const isPositive = number > 0;
  const color = isPositive ? "green" : "red";
  const Icon = isPositive ? Icons.arrowUp : Icons.arrowDown;

  return (
    <Badge className={cn(`bg-${color}-500`)}>
      <Icon className="mr-2 h-4 w-4" />
      {number}%
    </Badge>
  );
}
