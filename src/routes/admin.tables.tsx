import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout, StatusBadge } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/tables")({
  component: TablesAdmin,
});

const STATUSES = ["Available", "Occupied", "Reserved"] as const;

function TablesAdmin() {
  const [tables, setTables] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ table_number: 1, capacity: 2 });

  async function load() {
    const [{ data: t }, { data: b }] = await Promise.all([
      supabase.from("restaurant_tables").select("*").order("table_number"),
      supabase.from("bookings").select("*").order("booking_date", { ascending: false }).limit(20),
    ]);
    setTables(t ?? []); setBookings(b ?? []);
  }
  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("restaurant_tables").update({ status }).eq("id", id);
    if (!error) { toast.success("Updated"); load(); }
  }
  async function addTable() {
    const { error } = await supabase.from("restaurant_tables").insert({ table_number: form.table_number, capacity: form.capacity, status: "Available" });
    if (error) return toast.error(error.message);
    toast.success("Table added"); setOpen(false); load();
  }
  async function removeTable(id: string) {
    if (!confirm("Remove this table?")) return;
    await supabase.from("restaurant_tables").delete().eq("id", id);
    load();
  }
  async function setBookingStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    load();
  }

  return (
    <AdminLayout title="Tables & Bookings" subtitle="Manage seating and reservations" actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button><Plus className="mr-2 size-4" /> Add Table</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif text-2xl">New table</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Table number</Label><Input type="number" value={form.table_number} onChange={(e) => setForm({ ...form, table_number: Number(e.target.value) })} /></div>
            <div><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
            <Button onClick={addTable} className="w-full">Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    }>
      <h3 className="font-serif text-xl mb-4">Floor Plan</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
        {tables.map((t) => (
          <div key={t.id} className="bg-card border border-border rounded-2xl p-5 shadow-[var(--shadow-soft)]">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Table</p>
                <p className="font-serif text-3xl text-foreground">{t.table_number}</p>
              </div>
              <button onClick={() => removeTable(t.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3"><Users className="size-3.5" /> Seats {t.capacity}</div>
            <Select value={t.status} onValueChange={(v) => setStatus(t.id, v)}>
              <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <h3 className="font-serif text-xl mb-4">Recent Bookings</h3>
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-soft)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50"><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Customer</th><th className="px-5 py-3">Party</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Time</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Status</th><th className="px-5 py-3"></th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-5 py-4 font-medium">{b.customer_name}</td>
                  <td className="px-5 py-4">{b.party_size}</td>
                  <td className="px-5 py-4 text-muted-foreground">{b.booking_date}</td>
                  <td className="px-5 py-4 text-muted-foreground">{b.booking_time}</td>
                  <td className="px-5 py-4 text-muted-foreground text-xs">{b.customer_email ?? b.customer_phone ?? "—"}</td>
                  <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-4">
                    <Select value={b.status} onValueChange={(v) => setBookingStatus(b.id, v)}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>{["Pending", "Confirmed", "Cancelled", "Completed"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
