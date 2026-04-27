import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Armchair, Receipt, LogOut, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/tables", label: "Tables", icon: Armchair },
  { to: "/admin/billing", label: "Billing", icon: Receipt },
] as const;

export function AdminLayout({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const { pathname } = useLocation();
  const nav = useNavigate();
  const { user, isStaff, isAdmin, loading, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isStaff)) {
      nav({ to: "/auth" });
    }
  }, [loading, user, isStaff, nav]);

  if (loading || !user) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-secondary/40">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-secondary/40 p-6">
        <div className="max-w-md text-center bg-card rounded-2xl border border-border p-8 shadow-[var(--shadow-soft)]">
          <Shield className="size-10 text-muted-foreground mx-auto mb-3" />
          <h2 className="font-serif text-2xl mb-2">Access pending</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Your account exists but no role has been assigned. Please ask an administrator to grant you staff or admin access.
          </p>
          <Button onClick={() => signOut()} variant="outline" className="w-full">Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex bg-secondary/40">
      <aside
        className={`hidden md:flex shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <div className="px-4 py-6 border-b border-sidebar-border flex items-center justify-between gap-2">
          <Link to="/admin" className="flex items-center gap-2 min-w-0">
            <Logo size={36} />
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="font-serif text-lg leading-none text-primary truncate">Golden Spoon</h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{isAdmin ? "Admin" : "Staff"}</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-primary"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          {!collapsed && (
            <p className="text-[11px] text-muted-foreground px-3 truncate" title={user.email ?? ""}>
              {user.email}
            </p>
          )}
          <button
            onClick={() => signOut()}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="size-4 shrink-0" />
            {!collapsed && "Sign out"}
          </button>
          {!collapsed && (
            <Link to="/" className="block text-[11px] text-muted-foreground hover:text-primary text-center pt-2">
              ← Back to public site
            </Link>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card/80 backdrop-blur border-b border-border sticky top-0 z-10">
          <div className="px-6 lg:px-10 py-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl lg:text-3xl text-foreground">{title}</h2>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
          <nav className="md:hidden flex gap-1 px-4 pb-3 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.to;
              return (
                <Link key={item.to} to={item.to} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <main className="flex-1 px-6 lg:px-10 py-8">{children}</main>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-status-pending-bg text-status-pending",
    Preparing: "bg-status-preparing-bg text-status-preparing",
    Served: "bg-status-served-bg text-status-served",
    Cancelled: "bg-muted text-muted-foreground",
    Available: "bg-status-served-bg text-status-served",
    Occupied: "bg-status-preparing-bg text-status-preparing",
    Reserved: "bg-status-pending-bg text-status-pending",
    Confirmed: "bg-status-served-bg text-status-served",
    Completed: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
