import { cn } from "~/lib/utils";
import { fontInter } from "~/constants/font";
import { UserNav } from "./usernav";
import { Logo } from "./Logo";

export default function Header() {
  return (
    <div
      className={cn(
        "supports-backdrop-blur:bg-background/60 fixed left-0 right-0 top-0 z-20 border-b bg-background/95 font-sans antialiased backdrop-blur",
        fontInter.variable
      )}
    >
      <nav className="flex h-14 items-center justify-between px-4">
        <div className="flex flex-row gap-3">
          <Logo />
          <h2 className="text-3xl font-semibold tracking-tight">Soff</h2>
        </div>
        <div className={cn("block lg:!hidden")}>{/* <MobileSidebar /> */}</div>

        <div className="flex items-center gap-2">
          <UserNav />
          {/* <ThemeToggle /> */}
        </div>
      </nav>
    </div>
  );
}
