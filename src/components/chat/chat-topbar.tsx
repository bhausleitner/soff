import React from "react";
import { Info, Phone, Video } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { buttonVariants } from "../ui/button";

import { type Supplier } from "~/server/api/routers/supplier";

interface ChatTopbarProps {
  supplier: Supplier;
}

export const TopbarIcons = [{ icon: Phone }, { icon: Video }, { icon: Info }];

export default function ChatTopbar({ supplier }: ChatTopbarProps) {
  return (
    <div className="flex h-20 w-full items-center justify-between border-b p-4">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="font-medium">{supplier.name}</span>
          <span className="text-xs">{supplier.contactPerson}</span>
        </div>
      </div>

      <div>
        {TopbarIcons.map((icon, index) => (
          <Link
            key={index}
            href="#"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-9 w-9",
              "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
            )}
          >
            <icon.icon size={20} className="text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  );
}
