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
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { cn } from "~/lib/utils";

interface UserNavProps {
  isCollapsed: boolean;
}

export function UserNav({ isCollapsed }: UserNavProps) {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  const microsoftAuthUrlMutation =
    api.chat.requestMicrosoftAuthUrl.useMutation();

  const googleAuthUrlMutation = api.chat.requestGoogleAuthUrl.useMutation();

  const organization = user?.publicMetadata.organization as string;
  const isLoading = !isUserLoaded;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          className={cn(
            "flex w-64 w-full flex-row justify-center p-5 hover:cursor-pointer hover:bg-accent",
            isCollapsed && "justify-center"
          )}
        >
          {isLoading ? (
            <Skeleton className="h-10 w-10 rounded-full bg-soff" />
          ) : (
            <Avatar className={cn("h-10 w-10", !isCollapsed && "mr-3")}>
              <AvatarImage src={user?.imageUrl} alt={user?.username ?? ""} />
              <AvatarFallback>
                {startCase(toLower(user?.username?.[0]))}
              </AvatarFallback>
            </Avatar>
          )}
          {!isCollapsed && (
            <div className="flex cursor-pointer items-center justify-between">
              <div>
                {isLoading ? (
                  <>
                    <Skeleton className="mb-1 h-4 w-20 bg-soff" />
                    <Skeleton className="h-3 w-16 bg-soff" />
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">{user?.firstName}</p>
                    <p className="text-xs text-gray-500">{organization}</p>
                  </>
                )}
              </div>
              <Icons.chevronDown className="ml-10 h-4 w-4" />
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      {!isLoading && (
        <DropdownMenuContent className="m-3 w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.username}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => openUserProfile()}>
              Settings Dialog
              <DropdownMenuShortcut>
                <Icons.settings className="ml-3 size-5" />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            {user?.publicMetadata.emailProvider === "OUTLOOK" && (
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
            )}
            {user?.publicMetadata.emailProvider === "GMAIL" && (
              <DropdownMenuItem
                onClick={async () => {
                  const redirectUrl = await googleAuthUrlMutation.mutateAsync();
                  await router.push(redirectUrl);
                }}
              >
                Authenticate Google
                <DropdownMenuShortcut>
                  <Icons.fingerprint className="ml-3 size-5" />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
            Log out
            <DropdownMenuShortcut>
              <Icons.logout className="ml-3 size-5" />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
