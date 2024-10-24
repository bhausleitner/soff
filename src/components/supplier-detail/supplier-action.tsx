import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "../ui/dropdown-menu";

import { type Supplier } from "@prisma/client";

interface SupplierActionProps {
  row: {
    original: Supplier;
  };
}

export function SupplierAction({ row }: SupplierActionProps) {
  const supplier = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(supplier?.email ?? "")}
        >
          Copy supplier Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View supplier</DropdownMenuItem>
        <DropdownMenuItem>View supplier details</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
