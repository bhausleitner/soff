import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { type ContactLineItem } from "~/server/api/routers/supplier";
import { getInitials } from "~/utils/string-format";

export function ContactCell({ supplier }: { supplier: ContactLineItem }) {
  return (
    <div className="flex flex-grow flex-row items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-sidebar">
          {getInitials(supplier.contactPerson ?? "")}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <p className="font-bold">{supplier.contactPerson}</p>
        <p className="text-sm text-gray-500">{supplier.email}</p>
      </div>
    </div>
  );
}
