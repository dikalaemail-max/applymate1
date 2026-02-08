import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderOpen, Share2, MessageCircle, Settings, Menu, X, Rocket, Users, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderOpen, label: "My Applications", href: "/scholarships" },
  { icon: Share2, label: "Shared", href: "/shared" },
  { icon: MessageCircle, label: "Community", href: "/community" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const { isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="gradient-primary p-1.5 rounded-lg">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ApplyMate</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-1 rounded-lg hover:bg-sidebar-accent/50 transition-colors">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 top-[57px] z-50 bg-sidebar text-sidebar-foreground p-4 space-y-1 animate-fade-in">
          {!isAdmin && navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/60"
                )}
              >
                <item.icon className={cn("h-4 w-4", active && "text-[hsl(var(--sidebar-primary))]")} />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                pathname.startsWith("/admin") ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground/60"
              )}
            >
              <Users className="h-4 w-4" />
              Admin Panel
            </Link>
          )}
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-sidebar-foreground/50 w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </>
  );
}
