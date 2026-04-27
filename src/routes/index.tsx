import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { heroImage, resolveImage } from "@/lib/images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, Calendar, ChefHat } from "lucide-react";

export const Route = createFileRoute("/")({
  component: PublicHome,
});

type MenuItem = { id: string; name: string; description: string | null; price: number; category: string; image_url: string | null; available: boolean };

function PublicHome() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string>("All");

  useEffect(() => {
    supabase.from("menu_items").select("*").eq("available", true).order("category").then(({ data }) => {
      setItems((data as MenuItem[]) ?? []);
    });
  }, []);

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const filtered = items.filter(
    (i) =>
      (activeCat === "All" || i.category === activeCat) &&
      (search === "" || i.name.toLowerCase().includes(search.toLowerCase()) || (i.description ?? "").toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="min-h-dvh bg-background">
      {/* Nav */}
      <header className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 py-6">
          <div className="flex items-center gap-2 text-primary-foreground">
            <div className="size-9 rounded-lg flex items-center justify-center bg-primary-foreground/15 backdrop-blur">
              <Sparkles className="size-5" />
            </div>
            <span className="font-serif text-xl">Verdant Bistro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-primary-foreground/90">
            <a href="#menu" className="hover:text-accent transition">Menu</a>
            <a href="#booking" className="hover:text-accent transition">Reservations</a>
            <Link to="/admin" className="hover:text-accent transition">Staff Portal</Link>
          </nav>
          <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/90 border-0">
            <a href="#booking">Book a Table</a>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-[88vh] min-h-[600px] w-full overflow-hidden">
        <img src={heroImage} alt="Restaurant table with fresh herbs" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-10 flex flex-col justify-center">
          <p className="text-accent uppercase tracking-[0.3em] text-xs font-medium mb-4">Farm · Fire · Family</p>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-primary-foreground max-w-3xl leading-[1.05]">
            Where every plate <em className="text-accent not-italic">tells a story.</em>
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mt-6 text-lg">
            Seasonal, locally-sourced cuisine crafted with intention. Reserve your table and savor an unhurried evening.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 px-8" asChild>
              <a href="#booking"><Calendar className="mr-2 size-4" /> Reserve Now</a>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground px-8" asChild>
              <a href="#menu"><ChefHat className="mr-2 size-4" /> Explore Menu</a>
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
            <article key={item.id} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-500 hover:-translate-y-1">
              {item.image_url && (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img src={resolveImage(item.image_url)} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h3 className="font-serif text-xl text-foreground">{item.name}</h3>
                  <span className="font-serif text-xl text-primary tabular-nums">${Number(item.price).toFixed(2)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                <span className="inline-block mt-4 text-[11px] uppercase tracking-widest text-primary font-medium">{item.category}</span>
              </div>
            </article>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">No dishes match your search.</p>
          )}
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

      <footer className="bg-background border-t border-border py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="font-serif text-base text-primary">Verdant Bistro</div>
          <p>© 2026 Verdant Bistro. Crafted with care.</p>
        </div>
      </footer>
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
