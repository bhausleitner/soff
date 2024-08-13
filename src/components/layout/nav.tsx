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

interface NavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    href: string;
    icon: LucideIcon;
    subpages: string[];
  }[];
}

function containsSubpage(subpages: string[], pathname: string) {
  for (const subpage of subpages) {
    if (pathname.includes(subpage)) {
      return true;
    }
  }
  return false;
}

export function Nav({ links, isCollapsed }: NavProps) {
  const router = useRouter();
  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const variant = containsSubpage(link.subpages, router.pathname)
            ? "sidebarActive"
            : "sidebar";
          return isCollapsed ? (
            <Tooltip key={index} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
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
    </div>
  );
}
