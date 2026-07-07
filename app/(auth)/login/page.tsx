"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@northwind.demo");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await signIn("credentials", { redirect: false, email, password });
    setBusy(false);
    if (res?.error) {
      setError("Email or password is incorrect.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper relative overflow-hidden px-4 font-sans">
      {/* Decorative background blur */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-[400px] bg-surface rounded-[24px] p-10 shadow-float border border-slate-200/60 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-violet to-violetDeep rounded-xl flex items-center justify-center shadow-soft mb-4">
            <span className="font-display font-bold text-white text-xl">L</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-ink text-center">Welcome back</h1>
          <p className="text-sm text-slate-soft mt-2 text-center">Log in to your workspace</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-soft uppercase tracking-wider">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all duration-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-soft uppercase tracking-wider">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all duration-200"
            />
          </div>
          {error && <div className="text-xs font-medium text-coral bg-coral/10 p-3 rounded-lg text-center">{error}</div>}
          
          <button
            type="submit" disabled={busy}
            className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-violet to-violetDeep text-white text-sm font-semibold shadow-soft hover:shadow-float hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              try {
                await signIn("google", { callbackUrl: "/dashboard" });
              } catch (e) {
                console.error(e);
              }
              setBusy(false);
            }}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl border border-slate-200 bg-surface text-ink text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="mt-8 text-xs text-slate-soft leading-relaxed bg-slate-50 p-4 rounded-xl text-center">
          <p className="font-semibold text-ink mb-1">Demo credentials</p>
          admin@northwind.demo<br />
          Password: <span className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">Password123!</span>
        </div>
        
        <div className="mt-6 text-sm text-center">
          <Link href="/signup" className="text-violet font-semibold hover:text-violetDeep transition-colors">Create a new workspace instead →</Link>
        </div>
      </div>
    </div>
  );
}
