import type { PropsWithChildren } from "react";
import { cn } from "~/lib/utils";
import Sidebar from "./sidebar";
import Header from "./header";
import { fontInter } from "~/constants/font";

export const PageLayout = (props: PropsWithChildren) => {
  return (
    <>
      <Header />
      <div className={cn("flex h-screen overflow-hidden", fontInter.variable)}>
        <Sidebar />
        <main className="w-full pt-16 font-sans antialiased">
          {props.children}
        </main>
      </div>
    </>
  );
};
