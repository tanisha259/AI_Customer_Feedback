"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", workspaceName: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Could not create your account.");
      setBusy(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      redirect: false, email: form.email, password: form.password,
    });
    setBusy(false);
    if (signInRes?.error) {
      setError("Account created — please log in.");
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm bg-white border border-[#E7E2D6] rounded-2xl p-8 shadow-sm">
        <div className="font-display text-2xl font-semibold text-ink mb-1">Create your workspace</div>
        <div className="text-sm text-[#6B6B80] mb-6">You'll be the workspace's first Admin.</div>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {(["name", "workspaceName", "email", "password"] as const).map((field) => (
            <div key={field}>
              <label className="text-xs font-semibold text-ink capitalize">
                {field === "workspaceName" ? "Workspace / company name" : field}
              </label>
              <input
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                required
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-[#E7E2D6] text-sm"
              />
            </div>
          ))}
          {error && <div className="text-xs text-coral">{error}</div>}
          <button
            type="submit" disabled={busy}
            className="mt-2 w-full py-2.5 rounded-lg bg-violet text-white text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Creating…" : "Create workspace"}
          </button>
        </form>

        <div className="mt-4 text-xs text-center">
          <Link href="/login" className="text-violetDeep font-semibold">← Back to log in</Link>
        </div>
      </div>
    </div>
  );
}
