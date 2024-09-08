import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { startCase, toLower } from "lodash";
import { Icons } from "../icons";
import { type SupplierLineItem } from "~/server/api/routers/supplier";

export function SupplierCell({
  supplier,
  detailed = false
}: {
  supplier: SupplierLineItem;
  detailed?: boolean;
}) {
  return (
    <div className="flex flex-grow flex-row items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-sidebar">
          {startCase(toLower(supplier.name?.[0]))}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        {detailed && (
          <>
            <p className="font-bold">{supplier.name}</p>
            <div className="flex flex-row items-center gap-1">
              <Icons.user className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-500">{supplier.contactPerson}</p>
            </div>
            <div className="flex flex-row items-center gap-1">
              <Icons.mail className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-500">{supplier.email}</p>
            </div>
          </>
        )}
        {!detailed && (
          <>
            <p className="font-bold">{supplier.name}</p>
            <p className="text-sm text-gray-500">{supplier.email}</p>
          </>
        )}
      </div>
    </div>
  );
}
