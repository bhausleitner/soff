import { useEffect, type PropsWithChildren, useMemo } from "react";
import Header from "~/components/layout/header";
import Sidebar from "~/components/layout/sidebar";
import { Toaster } from "../ui/sonner";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";

export const PageLayout = (props: PropsWithChildren) => {
  const { user } = useUser();
  const upsertUser = api.user.upsertUser.useMutation();

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
    <>
      <Header />
      <div className={"flex h-screen overflow-hidden"}>
        <Sidebar />
        <main className="w-full flex-1 overflow-y-auto pt-16 font-sans antialiased">
          {props.children}
        </main>
        <Toaster position="top-right" richColors={true} theme="light" />
      </div>
    </>
  );
};
