import { useEffect, type PropsWithChildren, useMemo, useState } from "react";
import { Toaster } from "../ui/sonner";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import { Nav } from "./nav";
import { Icons } from "../icons";
import { cn } from "~/lib/utils";
import { Separator } from "../ui/separator";
import { UserNav } from "./usernav";
import { Button } from "../ui/button";
import { LogoBlackNoBackground } from "./LogoBlackNoBackground";

export const PageLayout = (props: PropsWithChildren) => {
  const { user } = useUser();
  const upsertUser = api.user.upsertUser.useMutation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableUser = useMemo(() => user, [user?.id, user?.emailAddresses]);

  useEffect(() => {
    if (stableUser && user?.publicMetadata?.syncedToDB !== true) {
      upsertUser.mutate({
        clerkUserId: user?.id ?? "",
        email: user?.emailAddresses[0]?.emailAddress ?? ""
      });
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableUser]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="bg-sidebar flex h-screen">
      <aside
        className={cn(
          "flex flex-col justify-between border-r border-gray-200 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-60"
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex flex-col">
          <div
            className={cn(
              "relative m-3 flex h-12 flex-row items-center",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-3 px-2">
              <div className="flex-shrink-0">
                <LogoBlackNoBackground />
              </div>
            </div>
            {!isCollapsed && isHovering && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="ml-auto"
              >
                <Icons.sidebarCollapse className="h-4 w-4" />
              </Button>
            )}
            {isCollapsed && isHovering && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform bg-accent"
              >
                <Icons.sidebarExpand className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Suppliers",
                href: "/suppliers",
                icon: Icons.suppliers,
                subpages: ["rfq", "suppliers"]
              },
              {
                title: "Quotes",
                href: "/quotes",
                icon: Icons.quotes,
                subpages: ["quotes"]
              }
            ]}
          />
        </div>

        <div>
          <Separator />
          <UserNav isCollapsed={isCollapsed} />
        </div>
      </aside>
      <main className="flex-1 overflow-hidden px-5 pb-3 pt-5 font-sans antialiased">
        {props.children}
      </main>
      <Toaster position="bottom-right" richColors={true} theme="light" />
    </div>
  );
};
