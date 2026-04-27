import { Link, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Armchair, Receipt, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/tables", label: "Tables", icon: Armchair },
  { to: "/admin/billing", label: "Billing", icon: Receipt },
] as const;

export function AdminLayout({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-dvh flex bg-secondary/40">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <Link to="/admin" className="px-6 py-7 border-b border-sidebar-border block">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-lg flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg leading-none text-primary">Verdant Bistro</h1>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mt-1">Admin Panel</p>
            </div>
          </div>
        </Link>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.to || (item.to !== "/admin" && pathname.startsWith(item.to));
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Link
            to="/"
            className="block text-xs text-muted-foreground hover:text-primary transition-colors text-center"
          >
            ← Back to public site
          </Link>
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
