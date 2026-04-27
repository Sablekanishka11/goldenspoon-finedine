import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, StatusBadge } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { pdf, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export const Route = createFileRoute("/admin/billing")({
  component: Billing,
});

function Billing() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("orders").select("*, restaurant_tables(table_number)").order("created_at", { ascending: false }).then(({ data }) => setOrders(data ?? []));
  }, []);

  async function openInvoice(o: any) {
    setSelected(o);
    const { data } = await supabase.from("order_items").select("*").eq("order_id", o.id);
    setItems(data ?? []);
  }

  const totalRevenue = orders.filter((o) => o.status === "Served").reduce((s, o) => s + Number(o.total), 0);
  const outstanding = orders.filter((o) => o.status !== "Served" && o.status !== "Cancelled").reduce((s, o) => s + Number(o.total), 0);

  return (
    <AdminLayout title="Billing & Invoices" subtitle="Generate invoices and review revenue">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-card border border-border rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Total Revenue</p><p className="font-serif text-3xl text-primary tabular-nums">${totalRevenue.toFixed(2)}</p></div>
        <div className="bg-card border border-border rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Outstanding</p><p className="font-serif text-3xl text-accent-foreground tabular-nums">${outstanding.toFixed(2)}</p></div>
        <div className="bg-card border border-border rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Total Orders</p><p className="font-serif text-3xl tabular-nums">{orders.length}</p></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border"><h3 className="font-serif text-xl">All Orders</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50"><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Total</th><th className="px-5 py-3"></th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.id} className={selected?.id === o.id ? "bg-secondary/40" : ""}>
                    <td className="px-5 py-4 font-medium">INV-{String(o.order_number).padStart(4, "0")}</td>
                    <td className="px-5 py-4">{o.customer_name ?? "—"}</td>
                    <td className="px-5 py-4"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-4 text-right tabular-nums">${Number(o.total).toFixed(2)}</td>
                    <td className="px-5 py-4 text-right"><Button size="sm" variant="outline" onClick={() => openInvoice(o)}>View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-[var(--shadow-soft)] h-fit sticky top-28">
          {selected ? (
            <div>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Invoice</p>
                  <p className="font-serif text-2xl">INV-{String(selected.order_number).padStart(4, "0")}</p>
                </div>
                <Button size="icon" variant="outline" onClick={() => window.print()}><Printer className="size-4" /></Button>
              </div>
              <div className="text-sm space-y-1 mb-6">
                <p><span className="text-muted-foreground">Customer:</span> {selected.customer_name ?? "—"}</p>
                <p><span className="text-muted-foreground">Date:</span> {new Date(selected.created_at).toLocaleString()}</p>
                <p><span className="text-muted-foreground">Status:</span> <StatusBadge status={selected.status} /></p>
              </div>
              <div className="border-t border-border pt-4 space-y-2">
                {items.length === 0 && <p className="text-sm text-muted-foreground">No itemised lines.</p>}
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between text-sm">
                    <span>{it.quantity}× {it.item_name}</span>
                    <span className="tabular-nums">${(Number(it.price) * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 flex justify-between font-serif text-lg">
                <span>Total</span>
                <span className="text-primary tabular-nums">${Number(selected.total).toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Select an order to view its invoice.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
