import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, user, isStaff, loading } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user && isStaff) nav({ to: "/admin" });
  }, [loading, user, isStaff, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const fn = mode === "login" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setBusy(false);
    if (error) return toast.error(error);
    if (mode === "signup") {
      toast.success("Account created. An admin must grant you access.");
    } else {
      toast.success("Welcome back");
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-secondary/40 p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-elegant)]">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <Logo size={44} />
          <div>
            <h1 className="font-serif text-2xl text-primary leading-none">Golden Spoon</h1>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Staff Portal</p>
          </div>
        </Link>

        <h2 className="font-serif text-xl text-center mb-1">{mode === "login" ? "Sign in" : "Create account"}</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "login" ? "Admin & staff access only." : "An admin must approve your role."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} maxLength={72} />
          </div>
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="block mx-auto mt-6 text-xs text-muted-foreground hover:text-primary"
        >
          {mode === "login" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>

        <Link to="/" className="block text-center mt-4 text-xs text-muted-foreground hover:text-primary">
          ← Back to Golden Spoon
        </Link>
      </div>
    </div>
  );
}
