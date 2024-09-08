import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from "~/components/ui/hover-card";
import { Badge } from "../ui/badge";
import { SupplierCell } from "./supplier-cell";
import { type SupplierLineItem } from "~/server/api/routers/supplier";

export function SupplierBadge({
  supplier
}: {
  supplier: { name: string; email: string; contactPerson: string };
}) {
  return (
    <HoverCard openDelay={1} closeDelay={1}>
      <HoverCardTrigger>
        <Badge variant="secondary">{supplier.name}</Badge>
      </HoverCardTrigger>
      <HoverCardContent className="w-full">
        <SupplierCell supplier={supplier as SupplierLineItem} detailed={true} />
      </HoverCardContent>
    </HoverCard>
  );
}
