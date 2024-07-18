import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { cn } from "~/lib/utils";
import { fontInter } from "~/constants/font";
import { Logo } from "./Logo";

export const metadata: Metadata = {
  title: "Authentication",
  description: "Authentication forms built using the components."
};

export default function AuthenticationPage() {
  return (
    <div
      className={cn(
        "relative h-screen flex-col items-center justify-center font-sans md:grid lg:max-w-none lg:grid-cols-2 lg:px-0",
        fontInter.variable
      )}
    >
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center gap-3 text-lg font-medium">
          <Logo />
          <h2 className="text-3xl font-semibold tracking-tight">Soff</h2>
        </div>
      </div>
      <div className="flex h-full items-center justify-center p-4 lg:p-8">
        <SignIn path={"/"} routing="path" />
      </div>
    </div>
  );
}
