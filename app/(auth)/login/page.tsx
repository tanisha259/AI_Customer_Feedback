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
