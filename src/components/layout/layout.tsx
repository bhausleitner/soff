import { useEffect, type PropsWithChildren } from "react";
import { cn } from "~/lib/utils";
import Header from "~/components/layout/header";
import Sidebar from "~/components/layout/sidebar";
import { fontInter } from "~/constants/font";
import { Toaster } from "../ui/sonner";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";

export const PageLayout = (props: PropsWithChildren) => {
  const { user } = useUser();
  const upsertUser = api.user.upsertUser.useMutation();

  useEffect(() => {
    console.log("running effect");
    if (user) {
      upsertUser.mutate({
        clerkUserId: user.id,
        email: user?.emailAddresses[0]?.emailAddress ?? ""
      });
    }
  });

  return (
    <>
      <Header />
      <div className={cn("flex h-screen overflow-hidden", fontInter.variable)}>
        <Sidebar />
        <main className="w-full flex-1 overflow-y-auto pt-16 font-sans antialiased">
          {props.children}
        </main>
        <Toaster position="top-right" richColors={true} theme="light" />
      </div>
    </>
  );
};
