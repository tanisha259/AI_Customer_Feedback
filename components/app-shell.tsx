"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard, Inbox, TrendingUp, MessageSquare, FileText, LogOut,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/trends", label: "Trends", icon: TrendingUp },
  { href: "/ask", label: "Ask LOOP", icon: MessageSquare },
  { href: "/reports", label: "Reports", icon: FileText },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VIEWER";
  const name = session?.user?.name ?? "…";

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="w-56 bg-ink flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-4">
          <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
            <path d="M20 6a14 14 0 1 0 9.9 4.1" stroke="#8B7CE8" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M29.9 3.5v7.4h-7.4" stroke="#8B7CE8" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div className="text-white font-display font-semibold text-lg leading-none">LOOP</div>
            <div className="text-[#8686A6] text-[10px] tracking-wide mt-0.5">FEEDBACK INTELLIGENCE</div>
          </div>
        </div>

        <nav className="px-3 mt-2 flex flex-col gap-0.5">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname?.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-violet/30 text-white" : "text-[#B4B4CC] hover:bg-white/5"
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 border-t border-white/10">
          <div className="text-[10px] text-[#6E6E90] leading-relaxed mb-3">
            Northwind Analytics workspace
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-[#B4B4CC] hover:text-white text-xs font-medium"
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-end px-8 py-4 border-b border-[#E7E2D6]">
          <div className="flex items-center gap-2.5 bg-white border border-[#E7E2D6] rounded-lg px-3 py-1.5">
            <span className="w-6 h-6 rounded-full bg-violet text-white text-[11px] font-bold flex items-center justify-center">
              {name[0]}
            </span>
            <div>
              <div className="text-xs font-semibold text-ink leading-none">{name}</div>
              <div className="text-[10px] text-[#6B6B80] mt-0.5">{role}</div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
