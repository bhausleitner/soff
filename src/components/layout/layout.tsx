import type { PropsWithChildren } from "react";
import { cn } from "~/lib/utils";
import Header from "~/components/layout/header";
import Sidebar from "~/components/layout/sidebar";
import { fontInter } from "~/constants/font";
import { Toaster } from "../ui/sonner";

export const PageLayout = (props: PropsWithChildren) => {
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
