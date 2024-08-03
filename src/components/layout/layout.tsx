import { useEffect, type PropsWithChildren, useMemo, useState } from "react";
import { Toaster } from "../ui/sonner";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from "../ui/resizable";
import { Nav } from "./nav";
import { Icons } from "../icons";
import { cn } from "~/lib/utils";
import { Logo } from "./Logo";

export const PageLayout = (props: PropsWithChildren) => {
  const { user } = useUser();
  const upsertUser = api.user.upsertUser.useMutation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableUser = useMemo(() => user, [user?.id, user?.emailAddresses]);

  useEffect(() => {
    if (stableUser && user?.publicMetadata?.syncedToDB !== true) {
      upsertUser.mutate({
        clerkUserId: user?.id ?? "",
        email: user?.emailAddresses[0]?.emailAddress ?? ""
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableUser]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      onLayout={(sizes: number[]) => {
        document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
          sizes
        )}`;
      }}
      className="fixed h-full"
    >
      <ResizablePanel
        defaultSize={10}
        collapsedSize={6}
        collapsible={true}
        minSize={13}
        maxSize={20}
        onCollapse={() => {
          setIsCollapsed(true);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            true
          )}`;
        }}
        onResize={() => {
          setIsCollapsed(false);
          document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
            false
          )}`;
        }}
        className={cn(
          isCollapsed && "min-w-[50px] transition-all duration-300 ease-in-out"
        )}
      >
        <div
          className={cn(
            "m-3 flex flex-row gap-3",
            isCollapsed && "justify-center"
          )}
        >
          <Logo />
          {!isCollapsed && (
            <h3 className="text-3xl font-medium tracking-tight">Soff</h3>
          )}
        </div>
        <Nav
          isCollapsed={isCollapsed}
          links={[
            {
              title: "Suppliers",
              href: "/suppliers",
              icon: Icons.suppliers
            },
            {
              title: "Quotes",
              href: "/quotes",
              icon: Icons.quotes
            }
          ]}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={90} minSize={30}>
        <div className="m-5 flex h-screen overflow-hidden">
          <main className="w-full overflow-hidden font-sans antialiased">
            {props.children}
          </main>
          <Toaster position="top-right" richColors={true} theme="light" />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
