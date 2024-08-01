import React from "react";
import { Icons } from "~/components/icons";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";

import { type Supplier } from "~/server/api/routers/supplier";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { startCase, toLower } from "lodash";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";

interface ChatTopbarProps {
  supplier: Supplier;
}

export const TopbarIcons = [
  { icon: Icons.phone, link: "https://teams.microsoft.com/", prefix: "Call" },
  {
    icon: Icons.video,
    link: "https://teams.microsoft.com/",
    prefix: "Video call"
  }
];

export default function ChatTopbar({ supplier }: ChatTopbarProps) {
  return (
    <div className="pr-4">
      <div className="flex w-full items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {startCase(toLower(supplier.contactPerson?.[0]))}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{supplier.contactPerson}</span>
          </div>
        </div>

        <div>
          {TopbarIcons.map((icon, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Link
                  href={icon.link}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-9 w-9",
                    "dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white"
                  )}
                >
                  <icon.icon size={20} className="text-muted-foreground" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{icon.prefix} on Microsoft Teams.</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
}
