import { Icons } from "~/components/icons";
import { type Row } from "@tanstack/react-table";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import { openErpContactUrl } from "~/hooks/erpHelper";
import { type ContactLineItem } from "~/server/api/routers/supplier";

interface ContactDropdownProps {
  row: Row<ContactLineItem>;
}

export function ContactDropdown({ row }: ContactDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <Icons.ellipsis className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem
          disabled={!row.original.organization?.erpContactUrl}
          className="cursor-pointer"
          onClick={() =>
            openErpContactUrl(
              row.original.organization?.erpContactUrl ?? "",
              row.original.erpId ?? 0
            )
          }
        >
          <Icons.odooLogo className="mr-2 h-4 w-4" />
          View in Odoo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
