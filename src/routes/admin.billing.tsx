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
        <div className="bg-card border border-border rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Total Revenue</p><p className="font-serif text-3xl text-primary tabular-nums">₹{totalRevenue.toFixed(2)}</p></div>
        <div className="bg-card border border-border rounded-2xl p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Outstanding</p><p className="font-serif text-3xl text-accent-foreground tabular-nums">₹{outstanding.toFixed(2)}</p></div>
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
                    <td className="px-5 py-4 text-right tabular-nums">₹{Number(o.total).toFixed(2)}</td>
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
                <div className="flex gap-1">
                  <Button size="icon" variant="outline" onClick={() => downloadPdf(selected, items)} title="Download PDF"><Download className="size-4" /></Button>
                  <Button size="icon" variant="outline" onClick={() => window.print()} title="Print"><Printer className="size-4" /></Button>
                </div>
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
                    <span className="tabular-nums">₹{(Number(it.price) * it.quantity).toFixed(2)}</span>
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

const pdfStyles = StyleSheet.create({
  page: { padding: 50, fontSize: 11, fontFamily: "Helvetica", color: "#1a1a1a" },
  header: { borderBottomWidth: 2, borderBottomColor: "#2d5a3d", paddingBottom: 16, marginBottom: 24 },
  brand: { fontSize: 22, fontFamily: "Helvetica-Bold", color: "#2d5a3d" },
  tagline: { fontSize: 9, color: "#888", marginTop: 4, letterSpacing: 1 },
  invoiceTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  meta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  metaCol: { flexDirection: "column", gap: 4 },
  label: { fontSize: 9, color: "#888", textTransform: "uppercase", letterSpacing: 1 },
  value: { fontSize: 11 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingVertical: 8, marginTop: 12 },
  th: { fontSize: 9, fontFamily: "Helvetica-Bold", textTransform: "uppercase", color: "#666" },
  row: { flexDirection: "row", paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: "#eee" },
  cellQty: { width: "10%" },
  cellName: { width: "60%" },
  cellPrice: { width: "15%", textAlign: "right" },
  cellTotal: { width: "15%", textAlign: "right" },
  totalsRow: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16, paddingTop: 12, borderTopWidth: 2, borderTopColor: "#2d5a3d" },
  totalLabel: { fontSize: 13, fontFamily: "Helvetica-Bold", marginRight: 24 },
  totalValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#2d5a3d" },
  footer: { position: "absolute", bottom: 30, left: 50, right: 50, textAlign: "center", fontSize: 9, color: "#888", borderTopWidth: 0.5, borderTopColor: "#ccc", paddingTop: 10 },
});

function InvoicePDF({ order, items }: { order: any; items: any[] }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.brand}>Golden Spoon</Text>
          <Text style={pdfStyles.tagline}>SERVING EXCELLENCE, ONE TABLE AT A TIME</Text>
        </View>

        <View style={pdfStyles.meta}>
          <View style={pdfStyles.metaCol}>
            <Text style={pdfStyles.invoiceTitle}>Invoice INV-{String(order.order_number).padStart(4, "0")}</Text>
            <Text style={pdfStyles.value}>Date: {new Date(order.created_at).toLocaleString()}</Text>
            <Text style={pdfStyles.value}>Status: {order.status}</Text>
          </View>
          <View style={pdfStyles.metaCol}>
            <Text style={pdfStyles.label}>Billed to</Text>
            <Text style={pdfStyles.value}>{order.customer_name ?? "Walk-in customer"}</Text>
          </View>
        </View>

        <View style={pdfStyles.tableHeader}>
          <Text style={[pdfStyles.th, pdfStyles.cellQty]}>Qty</Text>
          <Text style={[pdfStyles.th, pdfStyles.cellName]}>Item</Text>
          <Text style={[pdfStyles.th, pdfStyles.cellPrice]}>Price</Text>
          <Text style={[pdfStyles.th, pdfStyles.cellTotal]}>Total</Text>
        </View>

        {items.length === 0 ? (
          <View style={pdfStyles.row}><Text>No itemised lines for this order.</Text></View>
        ) : items.map((it) => (
          <View key={it.id} style={pdfStyles.row}>
            <Text style={pdfStyles.cellQty}>{it.quantity}</Text>
            <Text style={pdfStyles.cellName}>{it.item_name}</Text>
            <Text style={pdfStyles.cellPrice}>${Number(it.price).toFixed(2)}</Text>
            <Text style={pdfStyles.cellTotal}>${(Number(it.price) * it.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View style={pdfStyles.totalsRow}>
          <Text style={pdfStyles.totalLabel}>Total Due</Text>
          <Text style={pdfStyles.totalValue}>${Number(order.total).toFixed(2)}</Text>
        </View>

        <Text style={pdfStyles.footer}>Thank you for dining with Golden Spoon. © 2025 Made by Kanishka.</Text>
      </Page>
    </Document>
  );
}

async function downloadPdf(order: any, items: any[]) {
  const blob = await pdf(<InvoicePDF order={order} items={items} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${String(order.order_number).padStart(4, "0")}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
