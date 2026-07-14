"use client";

import { SessionProvider } from "next-auth/react";

// next-auth's SessionProvider is client-only (uses React context + polling),
// so it's isolated here and imported into the server-rendered root layout.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

// Note: isolated client-side session provider to prevent full page rendering overhead
