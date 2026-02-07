import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, GraduationCap, Share2, Settings, Menu, X, BookOpen, Users, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: GraduationCap, label: "Scholarships", href: "/scholarships" },
  { icon: Share2, label: "Shared", href: "/shared" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function MobileNav() {
  const { pathname } = useLocation();
  const { isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar text-sidebar-foreground border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-sidebar-primary" />
          <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ScholarTrack</span>
        </div>
        <button onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 top-[57px] z-50 bg-sidebar text-sidebar-foreground p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-sidebar-accent text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin/users"
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith("/admin") ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground/70"
              )}
            >
              <Users className="h-4 w-4" />
              Admin: Users
            </Link>
          )}
          <button
            onClick={() => { signOut(); setOpen(false); }}
            className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-sidebar-foreground/70 w-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </>
  );
}
