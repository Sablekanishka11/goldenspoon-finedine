import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, StatusBadge } from "@/components/AdminLayout";
import { resolveImage } from "@/lib/images";
import { DollarSign, ShoppingBag, Armchair, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, activeTables: 0, pending: 0 });
  const [recent, setRecent] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const [{ data: orders }, { data: tables }, { data: menu }] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("restaurant_tables").select("*"),
        supabase.from("menu_items").select("*").limit(3),
      ]);
      const o = orders ?? [];
      const todays = o.filter((x) => new Date(x.created_at) >= today);
      setStats({
        orders: todays.length || o.length,
        revenue: (todays.length ? todays : o).reduce((s, x) => s + Number(x.total), 0),
        activeTables: (tables ?? []).filter((t) => t.status !== "Available").length,
        pending: o.filter((x) => x.status === "Pending").length,
      });
      setRecent(o.slice(0, 5));
      setHighlights(menu ?? []);
    }
    load();
  }, []);

  return (
    <AdminLayout title="Dashboard" subtitle="Service overview at a glance">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={String(stats.orders)} tint="primary" />
        <StatCard icon={DollarSign} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} tint="accent" />
        <StatCard icon={Armchair} label="Active Tables" value={String(stats.activeTables)} tint="primary" />
        <StatCard icon={Clock} label="Pending" value={String(stats.pending)} tint="warn" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-xl">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-primary font-medium hover:underline">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="pb-3 pr-2">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.map((o) => (
                  <tr key={o.id}>
                    <td className="py-4 font-medium">#{String(o.order_number).padStart(4, "0")}</td>
                    <td className="py-4">{o.customer_name ?? "—"}</td>
                    <td className="py-4 text-muted-foreground">{new Date(o.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="py-4"><StatusBadge status={o.status} /></td>
                    <td className="py-4 text-right tabular-nums font-medium">${Number(o.total).toFixed(2)}</td>
                  </tr>
                ))}
                {recent.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No orders yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-xl">Menu Highlights</h3>
            <Link to="/admin/menu" className="text-xs text-primary font-medium hover:underline">Manage →</Link>
          </div>
          <div className="space-y-4">
            {highlights.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="size-14 rounded-lg overflow-hidden bg-muted shrink-0">
                  {m.image_url && <img src={resolveImage(m.image_url)} alt={m.name} loading="lazy" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.description}</p>
                </div>
                <div className="font-serif text-primary tabular-nums">${Number(m.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, tint }: { icon: any; label: string; value: string; tint: "primary" | "accent" | "warn" }) {
  const tints = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent-foreground",
    warn: "bg-status-pending-bg text-status-pending",
  };
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 mb-3">
        <div className={`size-10 rounded-xl flex items-center justify-center ${tints[tint]}`}>
          <Icon className="size-5" />
        </div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      </div>
      <p className="font-serif text-3xl text-foreground tabular-nums">{value}</p>
    </div>
  );
}
