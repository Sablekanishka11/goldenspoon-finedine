import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { resolveImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Search, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { resolveImage as _resolveImage } from "@/lib/images";

export const Route = createFileRoute("/admin/menu")({
  component: MenuAdmin,
});

type MenuItem = { id: string; name: string; description: string | null; price: number; category: string; image_url: string | null; available: boolean };
const empty: Omit<MenuItem, "id"> = { name: "", description: "", price: 0, category: "Mains", image_url: "", available: true };

function MenuAdmin() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(empty);

  async function load() {
    const { data } = await supabase.from("menu_items").select("*").order("category").order("name");
    setItems((data as MenuItem[]) ?? []);
  }
  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null); setForm(empty); setOpen(true);
  }
  function openEdit(item: MenuItem) {
    setEditing(item);
    setForm({ name: item.name, description: item.description ?? "", price: Number(item.price), category: item.category, image_url: item.image_url ?? "", available: item.available });
    setOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return toast.error("Name required");
    const payload = { ...form, name: form.name.trim().slice(0, 100), description: (form.description ?? "").trim().slice(0, 500), category: form.category.trim().slice(0, 50) || "Mains", price: Math.max(0, Number(form.price)) };
    const { error } = editing
      ? await supabase.from("menu_items").update(payload).eq("id", editing.id)
      : await supabase.from("menu_items").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Item updated" : "Item added");
    setOpen(false); load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  }

  const filtered = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout
      title="Menu"
      subtitle="Manage dishes, pricing, and availability"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 size-4" /> Add Item</Button></DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-serif text-2xl">{editing ? "Edit item" : "New menu item"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} /></div>
              <div><Label>Description</Label><Input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
                <div><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} maxLength={50} /></div>
              </div>
              <ImageUploader value={form.image_url ?? ""} onChange={(url) => setForm({ ...form, image_url: url })} />
              <div className="flex items-center justify-between border-t border-border pt-3"><Label>Available</Label><Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} /></div>
              <Button onClick={save} className="w-full">{editing ? "Save changes" : "Create item"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu..." className="pl-10 bg-card" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((item) => (
          <article key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elegant)] transition-all">
            {item.image_url && (
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                <img src={resolveImage(item.image_url)} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <h3 className="font-serif text-lg leading-tight">{item.name}</h3>
                <span className="font-serif text-primary tabular-nums">${Number(item.price).toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className="inline-block text-[10px] uppercase tracking-widest text-primary font-semibold">{item.category}</span>
                {!item.available && <span className="text-[10px] uppercase tracking-wider text-destructive font-semibold">Hidden</span>}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(item)}><Pencil className="size-3.5 mr-1.5" /> Edit</Button>
                <Button variant="outline" size="sm" onClick={() => remove(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="size-3.5" /></Button>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground py-12">No menu items found.</p>}
      </div>
    </AdminLayout>
  );
}
