import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Share2,
  Users,
  Settings,
  LogOut,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GraduationCap, label: "My Scholarships", href: "/scholarships" },
  { icon: Share2, label: "Shared with Me", href: "/shared" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

const adminItems = [
  { icon: Users, label: "Admin: Users", href: "/admin/users" },
];

export function AppSidebar() {
  const { pathname } = useLocation();
  const { isAdmin, signOut, user } = useAuth();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-sidebar-border">
        <BookOpen className="h-7 w-7 text-sidebar-primary" />
        <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          ScholarTrack
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href || pathname.startsWith(item.href + "/")
                ? "bg-sidebar-accent text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                Admin
              </span>
            </div>
            {adminItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-sidebar-accent text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
