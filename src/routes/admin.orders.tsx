import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, StatusBadge } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["Pending", "Preparing", "Served", "Cancelled"] as const;

function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("All");

  async function load() {
    const { data } = await supabase.from("orders").select("*, restaurant_tables(table_number)").order("created_at", { ascending: false });
    setOrders(data ?? []);
  }
  useEffect(() => {
    load();
    const ch = supabase.channel("orders").on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Status → ${status}`);
  }

  const filtered = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <AdminLayout title="Orders" subtitle="Live kitchen queue and order tracking">
      <div className="flex gap-2 mb-6 flex-wrap">
        {["All", ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${filter === s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-secondary"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Table</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-4 font-medium">#{String(o.order_number).padStart(4, "0")}</td>
                  <td className="px-5 py-4">{o.customer_name ?? "—"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{o.restaurant_tables?.table_number ? `Table ${o.restaurant_tables.table_number}` : "Takeaway"}</td>
                  <td className="px-5 py-4 text-muted-foreground">{new Date(o.created_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                  <td className="px-5 py-4 text-right tabular-nums font-medium">${Number(o.total).toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                      <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No orders</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={async () => {
          const { error } = await supabase.from("orders").insert({ customer_name: "Walk-in", status: "Pending", total: 0 });
          if (error) return toast.error(error.message);
          toast.success("Order created");
        }}>+ New Order</Button>
      </div>
    </AdminLayout>
  );
}
