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
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm bg-white border border-[#E7E2D6] rounded-2xl p-8 shadow-sm">
        <div className="font-display text-2xl font-semibold text-ink mb-1">LOOP</div>
        <div className="text-sm text-[#6B6B80] mb-6">Log in to your workspace</div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-ink">Email</label>
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E7E2D6] text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink">Password</label>
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E7E2D6] text-sm"
            />
          </div>
          {error && <div className="text-xs text-coral">{error}</div>}
          <button
            type="submit" disabled={busy}
            className="mt-2 w-full py-2.5 rounded-lg bg-violet text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-[#E7E2D6]">
          <button
            type="button"
            onClick={async () => {
              setBusy(true);
              try {
                await signIn("google", { callbackUrl: "/dashboard" });
              } catch (e) {
                console.error(e);
              }
              // If we didn't redirect, reset busy state
              setBusy(false);
            }}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#E7E2D6] bg-white text-ink text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-60"
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

        <div className="mt-5 text-xs text-[#6B6B80] leading-relaxed border-t border-[#E7E2D6] pt-4">
          Demo credentials (seeded workspace "Northwind Analytics"):<br />
          admin@northwind.demo · analyst@northwind.demo · viewer@northwind.demo<br />
          Password for all: <span className="font-mono">Password123!</span>
        </div>
        <div className="mt-4 text-xs text-center">
          <Link href="/signup" className="text-violetDeep font-semibold">Create a new workspace instead →</Link>
        </div>
      </div>
    </div>
  );
}
