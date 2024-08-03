import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "~/components/ui/tooltip";
import { useRouter } from "next/router";
import { UserNav } from "./usernav";
import { Separator } from "../ui/separator";

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    href: string;
    icon: LucideIcon;
  }[];
}

export function Nav({ links, isCollapsed }: NavProps) {
  const router = useRouter();
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex h-full flex-col justify-between py-2 pb-16 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const variant = router.pathname === link.href ? "soff" : "ghost";
          return isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="#"
                  className={cn(
                    buttonVariants({ variant: variant, size: "icon" }),
                    "h-9 w-9"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={index}
              href={link.href}
              className={cn(
                buttonVariants({ variant: variant, size: "sm" }),
                "justify-start"
              )}
            >
              <link.icon className="mr-2 h-5 w-5" />
              {link.title}
            </Link>
          );
        })}
      </nav>
      <div className="px-2">
        <Separator className="mt-2" />
        <UserNav isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}
