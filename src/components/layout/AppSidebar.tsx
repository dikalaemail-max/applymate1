import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderOpen,
  Share2,
  MessageCircle,
  Users,
  Settings,
  LogOut,
  Rocket,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderOpen, label: "My Applications", href: "/scholarships" },
  { icon: Share2, label: "Shared with Me", href: "/shared" },
  { icon: MessageCircle, label: "Community", href: "/community" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const adminItems = [
  { icon: Users, label: "Admin Panel", href: "/admin" },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { isAdmin, signOut, user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border relative overflow-hidden h-screen sticky top-0">
      {/* Subtle glow at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-32 rounded-full bg-[hsl(var(--sidebar-primary))] opacity-[0.07] blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-2.5 px-6 py-5 border-b border-sidebar-border">
        <div className="gradient-primary p-2 rounded-xl">
          <Rocket className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ApplyMate
        </span>
      </div>

      <nav className="relative flex-1 px-3 py-4 space-y-1">
        {!isAdmin && navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-accent text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4 transition-colors", active && "text-[hsl(var(--sidebar-primary))]")} />
              {item.label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full gradient-primary" />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="pb-1 px-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-sidebar-foreground/30">
                Admin
              </span>
            </div>
            {adminItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-sidebar-accent text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="relative px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center text-xs font-bold text-white shadow-sm">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200 w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
