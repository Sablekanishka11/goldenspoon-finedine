import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { heroImage, resolveImage } from "@/lib/images";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, ChefHat, ShoppingBag, Plus, Minus, Trash2, Heart } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: PublicHome,
});

type MenuItem = { id: string; name: string; description: string | null; price: number; category: string; image_url: string | null; available: boolean };
type CartLine = { item: MenuItem; quantity: number };

function PublicHome() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    supabase.from("menu_items").select("*").eq("available", true).order("category").then(({ data }) => {
      setItems((data as MenuItem[]) ?? []);
    });
    supabase.from("restaurant_tables").select("*").order("table_number").then(({ data }) => {
      setTables(data ?? []);
    });
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = items.filter(
    (i) =>
      (activeCat === "All" || i.category === activeCat) &&
      (search === "" || i.name.toLowerCase().includes(search.toLowerCase()) || (i.description ?? "").toLowerCase().includes(search.toLowerCase())),
  );

  const cartTotal = useMemo(() => cart.reduce((s, l) => s + l.quantity * Number(l.item.price), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.quantity, 0), [cart]);

  function addToCart(item: MenuItem) {
    setCart((c) => {
      const existing = c.find((l) => l.item.id === item.id);
      if (existing) return c.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      return [...c, { item, quantity: 1 }];
    });
    toast.success(`Added ${item.name}`);
  }
  function changeQty(id: string, delta: number) {
    setCart((c) => c.flatMap((l) => l.item.id === id ? (l.quantity + delta <= 0 ? [] : [{ ...l, quantity: l.quantity + delta }]) : [l]));
  }
  function removeLine(id: string) { setCart((c) => c.filter((l) => l.item.id !== id)); }

  return (
    <div className="min-h-dvh bg-background">
      {/* Nav */}
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-5">
          <Link to="/" className="flex items-center gap-2.5 text-primary-foreground">
            <Logo size={40} />
            <div>
              <span className="font-serif text-xl block leading-none">Golden Spoon</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-accent">Fine Dining</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm text-primary-foreground/90 font-medium">
            <a href="#menu" className="hover:text-accent transition">Menu</a>
            <a href="#order" className="hover:text-accent transition">Order</a>
            <a href="#booking" className="hover:text-accent transition">Reservations</a>
            <a href="#about" className="hover:text-accent transition">About</a>
            <Link to="/auth" className="hover:text-accent transition">Staff</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setCartOpen(true)}
              className="bg-primary-foreground/10 backdrop-blur text-primary-foreground hover:bg-primary-foreground/20 border border-primary-foreground/20 relative"
            >
              <ShoppingBag className="size-4" />
              <span className="hidden sm:inline ml-1">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-full size-5 flex items-center justify-center">{cartCount}</span>
              )}
            </Button>
            <Button asChild className="hidden sm:inline-flex bg-accent text-accent-foreground hover:bg-accent/90 border-0">
              <a href="#booking">Book a Table</a>
            </Button>
            <button onClick={() => setMobileNavOpen((o) => !o)} className="md:hidden text-primary-foreground p-2" aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
        {mobileNavOpen && (
          <div className="md:hidden mx-6 mb-4 bg-card/95 backdrop-blur rounded-xl border border-border p-4 flex flex-col gap-3 text-sm">
            <a href="#menu" onClick={() => setMobileNavOpen(false)}>Menu</a>
            <a href="#order" onClick={() => setMobileNavOpen(false)}>Order</a>
            <a href="#booking" onClick={() => setMobileNavOpen(false)}>Reservations</a>
            <a href="#about" onClick={() => setMobileNavOpen(false)}>About</a>
            <Link to="/auth" onClick={() => setMobileNavOpen(false)}>Staff Portal</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
        <img src={heroImage} alt="Golden Spoon dining experience" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-center">
          <p className="text-accent uppercase tracking-[0.3em] text-xs font-medium mb-4">Welcome to Golden Spoon</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-primary-foreground max-w-3xl leading-[1.05]">
            Serving excellence, <em className="text-accent not-italic">one table at a time.</em>
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mt-6 text-lg">
            Hand-crafted seasonal cuisine, warm hospitality, and an unhurried evening that you'll remember.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8" asChild>
              <a href="#booking"><Calendar className="mr-2 size-4" /> Reserve a Table</a>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground px-8" asChild>
              <a href="#menu"><ChefHat className="mr-2 size-4" /> Explore the Menu</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Menu */}
      <section id="menu" className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="text-center mb-12">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-medium mb-3">Our Kitchen</p>
          <h2 className="font-serif text-4xl md:text-5xl">The Menu</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">A rotating selection of dishes that celebrate the season.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dishes..." className="pl-10 h-11 bg-card" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeCat === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <article key={item.id} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-500 hover:-translate-y-1 flex flex-col">
              {item.image_url && (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={resolveImage(item.image_url)} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h3 className="font-serif text-xl text-foreground">{item.name}</h3>
                  <span className="font-serif text-xl text-primary tabular-nums">₹{Number(item.price).toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{item.description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="inline-block text-[11px] uppercase tracking-widest text-primary font-medium">{item.category}</span>
                  <Button size="sm" onClick={() => addToCart(item)} className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Plus className="size-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">No dishes match your search.</p>
          )}
        </div>
      </section>

      {/* About / Story */}
      <section id="about" className="bg-secondary/40 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-medium mb-3">Our Story</p>
          <h2 className="font-serif text-4xl md:text-5xl mb-6">A passion for hospitality</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Golden Spoon began with a simple belief — that food, when crafted with intention and served with grace, brings people closer.
            Every plate, every pour, every greeting at our door carries that same belief forward.
          </p>
        </div>
      </section>

      {/* Order */}
      <section id="order" className="max-w-4xl mx-auto px-6 lg:px-10 py-24">
        <div className="text-center mb-10">
          <p className="text-primary uppercase tracking-[0.3em] text-xs font-medium mb-3">Order Online</p>
          <h2 className="font-serif text-4xl md:text-5xl">Build your order</h2>
          <p className="text-muted-foreground mt-3">Add dishes from the menu above, then review your order in the cart.</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-[var(--shadow-soft)]">
          <ShoppingBag className="size-10 text-primary mx-auto mb-3" />
          <p className="text-2xl font-serif mb-1">{cartCount} item{cartCount === 1 ? "" : "s"} in your cart</p>
          <p className="text-muted-foreground mb-6">Subtotal: <span className="text-primary font-semibold tabular-nums">₹{cartTotal.toFixed(2)}</span></p>
          <Button onClick={() => setCartOpen(true)} disabled={cartCount === 0} size="lg" className="bg-primary">
            Review & Place Order
          </Button>
        </div>
      </section>

      {/* Booking */}
      <section id="booking" className="bg-primary text-primary-foreground py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-accent uppercase tracking-[0.3em] text-xs font-medium mb-3">Reservations</p>
            <h2 className="font-serif text-4xl md:text-5xl">Book your table</h2>
            <p className="text-primary-foreground/70 mt-3">Secure your evening with us. We'll confirm shortly.</p>
          </div>
          <BookingForm />
        </div>
      </section>

      <SiteFooter />

      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl">Your Order</SheetTitle>
          </SheetHeader>
          <CartView cart={cart} tables={tables} total={cartTotal} onChangeQty={changeQty} onRemove={removeLine} onPlaced={() => { setCart([]); setCartOpen(false); }} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CartView({ cart, tables, total, onChangeQty, onRemove, onPlaced }: { cart: CartLine[]; tables: any[]; total: number; onChangeQty: (id: string, d: number) => void; onRemove: (id: string) => void; onPlaced: () => void }) {
  const [name, setName] = useState("");
  const [tableId, setTableId] = useState<string>("takeaway");
  const [submitting, setSubmitting] = useState(false);

  async function placeOrder() {
    if (cart.length === 0) return toast.error("Your cart is empty");
    if (!name.trim()) return toast.error("Please enter your name");
    setSubmitting(true);
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: name.trim().slice(0, 100),
        table_id: tableId === "takeaway" ? null : tableId,
        status: "Pending",
        total: Number(total.toFixed(2)),
      })
      .select()
      .single();
    if (error || !order) {
      setSubmitting(false);
      return toast.error(error?.message ?? "Could not place order");
    }
    const lines = cart.map((l) => ({
      order_id: order.id,
      menu_item_id: l.item.id,
      item_name: l.item.name,
      price: Number(l.item.price),
      quantity: l.quantity,
    }));
    const { error: e2 } = await supabase.from("order_items").insert(lines);
    setSubmitting(false);
    if (e2) return toast.error(e2.message);
    toast.success(`Order #${String(order.order_number).padStart(4, "0")} placed!`);
    onPlaced();
  }

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <ShoppingBag className="size-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Your cart is empty. Add a dish from the menu to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {cart.map((l) => (
          <div key={l.item.id} className="flex gap-3 p-3 rounded-lg border border-border bg-card">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{l.item.name}</p>
              <p className="text-xs text-muted-foreground">${Number(l.item.price).toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => onChangeQty(l.item.id, -1)} className="size-7 rounded-md bg-muted hover:bg-secondary flex items-center justify-center"><Minus className="size-3" /></button>
              <span className="w-6 text-center text-sm font-medium tabular-nums">{l.quantity}</span>
              <button onClick={() => onChangeQty(l.item.id, +1)} className="size-7 rounded-md bg-muted hover:bg-secondary flex items-center justify-center"><Plus className="size-3" /></button>
              <button onClick={() => onRemove(l.item.id)} className="size-7 rounded-md text-destructive hover:bg-destructive/10 flex items-center justify-center ml-1"><Trash2 className="size-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div>
          <Label>Your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="e.g. Alex Morgan" />
        </div>
        <div>
          <Label>Table</Label>
          <Select value={tableId} onValueChange={setTableId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="takeaway">Takeaway / no table</SelectItem>
              {tables.map((t) => (
                <SelectItem key={t.id} value={t.id}>Table {t.table_number} ({t.capacity} seats · {t.status})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-serif text-2xl text-primary tabular-nums">${total.toFixed(2)}</span>
        </div>
        <Button onClick={placeOrder} disabled={submitting} className="w-full" size="lg">
          {submitting ? "Placing..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}

function BookingForm() {
  const [form, setForm] = useState({ customer_name: "", customer_email: "", customer_phone: "", party_size: 2, booking_date: "", booking_time: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      customer_name: form.customer_name.trim().slice(0, 100),
      customer_email: form.customer_email.trim().slice(0, 255) || null,
      customer_phone: form.customer_phone.trim().slice(0, 30) || null,
      party_size: Math.max(1, Math.min(20, Number(form.party_size))),
      booking_date: form.booking_date,
      booking_time: form.booking_time,
      notes: form.notes.trim().slice(0, 500) || null,
    });
    setSubmitting(false);
    if (!error) {
      setDone(true);
      setForm({ customer_name: "", customer_email: "", customer_phone: "", party_size: 2, booking_date: "", booking_time: "", notes: "" });
    } else {
      toast.error(error.message);
    }
  }

  if (done) {
    return (
      <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-2xl p-10 text-center backdrop-blur">
        <h3 className="font-serif text-2xl mb-2">Reservation received ✦</h3>
        <p className="text-primary-foreground/80">Thank you. We'll confirm your booking shortly.</p>
        <Button onClick={() => setDone(false)} variant="secondary" className="mt-6 bg-accent text-accent-foreground hover:bg-accent/90 border-0">Make another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-primary-foreground/5 backdrop-blur border border-primary-foreground/15 rounded-2xl p-8 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} placeholder="Full name *" maxLength={100} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-11" />
        <Input value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} type="email" placeholder="Email" maxLength={255} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-11" />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} placeholder="Phone" maxLength={30} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-11" />
        <Input required type="number" min={1} max={20} value={form.party_size} onChange={(e) => setForm({ ...form, party_size: Number(e.target.value) })} placeholder="Party size" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 h-11" />
        <div className="sm:col-span-1" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Input required type="date" value={form.booking_date} onChange={(e) => setForm({ ...form, booking_date: e.target.value })} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground h-11" />
        <Input required type="time" value={form.booking_time} onChange={(e) => setForm({ ...form, booking_time: e.target.value })} className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground h-11" />
      </div>
      <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={500} placeholder="Special requests (optional)" rows={3} className="w-full rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent" />
      <Button type="submit" disabled={submitting} size="lg" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
        {submitting ? "Reserving..." : "Reserve Table"}
      </Button>
    </form>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground/90 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Logo size={36} />
              <div>
                <p className="font-serif text-xl">Golden Spoon</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-accent">Fine Dining</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 italic">"Serving excellence, one table at a time."</p>
          </div>

          <div>
            <h4 className="font-serif text-base mb-3 text-accent">Hours</h4>
            <ul className="space-y-1.5 text-sm text-primary-foreground/70">
              <li>Mon–Thu · 5pm – 10pm</li>
              <li>Fri–Sat · 5pm – 11pm</li>
              <li>Sun · 11am – 9pm (Brunch)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base mb-3 text-accent">Food Policy</h4>
            <ul className="space-y-1.5 text-sm text-primary-foreground/70">
              <li>All ingredients locally & ethically sourced</li>
              <li>Dietary preferences honored — please ask</li>
              <li>Prepared fresh on order; allow 20–30 min</li>
              <li>Allergens labeled. Tell us about allergies.</li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-base mb-3 text-accent">Website Policy</h4>
            <ul className="space-y-1.5 text-sm text-primary-foreground/70">
              <li>Reservations subject to availability</li>
              <li>Online orders are tracked in real time</li>
              <li>Personal info used only to fulfill orders</li>
              <li>Prices may vary by season</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/15 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/60">
          <p>© 2025 Golden Spoon. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made by Kanishka with <Heart className="size-3.5 fill-accent text-accent" />
          </p>
        </div>
      </div>
    </footer>
  );
}
