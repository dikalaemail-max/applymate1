import { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { MobileNav } from "./MobileNav";

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col relative">
        {/* Subtle mesh gradient overlay on main content */}
        <div className="absolute inset-0 mesh-gradient pointer-events-none opacity-50" />
        <MobileNav />
        <main className="relative flex-1 p-4 md:p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
