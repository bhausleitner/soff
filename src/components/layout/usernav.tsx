"use client";
import { useUser, useClerk } from "@clerk/nextjs";
import { startCase, toLower } from "lodash";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
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

export function UserNav() {
  const user = useUser();
  const router = useRouter();
  const { signOut } = useClerk();

  const microsoftAuthUrlMutation =
    api.chat.requestMicrosoftAuthUrl.useMutation();

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.user?.imageUrl}
                alt={user?.user?.username ?? ""}
              />
              <AvatarFallback>
                {startCase(toLower(user?.user?.username?.[0]))}
              </AvatarFallback>
            </Avatar>
          </Button>
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
