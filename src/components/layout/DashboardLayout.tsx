import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "@/components/CommandPalette";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Ambient mesh gradient */}
        <div className="absolute inset-0 mesh-gradient pointer-events-none opacity-70" />
        <MobileNav />
        <main className="relative flex-1 p-4 md:p-8 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
      <CommandPalette />
    </div>
  );
}
