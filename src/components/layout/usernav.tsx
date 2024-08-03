"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { startCase, toLower } from "lodash";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Icons } from "~/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { cn } from "~/lib/utils";

interface UserNavProps {
  isCollapsed: boolean;
}

export function UserNav({ isCollapsed }: UserNavProps) {
  const user = useUser();
  const router = useRouter();
  const { signOut } = useClerk();

  const microsoftAuthUrlMutation =
    api.chat.requestMicrosoftAuthUrl.useMutation();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              "flex flex-row gap-3 p-3 hover:cursor-pointer hover:bg-accent",
              isCollapsed && "justify-center"
            )}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.user?.imageUrl}
                alt={user?.user?.username ?? ""}
              />
              <AvatarFallback>
                {startCase(toLower(user?.user?.username?.[0]))}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex cursor-pointer items-center">
                <div>
                  <p className="text-sm font-medium">{"Berni"}</p>
                  <p className="text-xs text-gray-500">{"ShoesOff"}</p>
                </div>
                <Icons.chevronDown className="ml-10 h-4 w-4" />
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.user?.username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={async () => {
                await router.push(
                  window.location.host === "localhost:3000"
                    ? "https://lucky-crow-92.accounts.dev/user"
                    : "https://accounts.soff.ai/user"
                );
              }}
            >
              Settings
              <DropdownMenuShortcut>
                <Icons.settings className="ml-3 size-5" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                const redirectUrl =
                  await microsoftAuthUrlMutation.mutateAsync();
                await router.push(redirectUrl);
              }}
            >
              Authenticate Outlook
              <DropdownMenuShortcut>
                <Icons.fingerprint className="ml-3 size-5" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
            Log out
            <DropdownMenuShortcut>
              <Icons.logout className="ml-3 size-5" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}
