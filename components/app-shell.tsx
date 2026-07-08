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
    <div className="flex min-h-screen bg-paper font-sans relative">
      {/* Decorative ambient background for the dashboard area */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden ml-[260px]">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-violet/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] right-[20%] w-[700px] h-[700px] bg-emerald-400/5 rounded-full blur-[120px]" />
      </div>
      
      <aside className="w-[260px] bg-ink flex flex-col shrink-0 relative overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.1)] z-30">
        {/* Subtle glow effect in the top left */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet/20 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-3 px-6 pt-8 pb-6 relative z-10 border-b border-white/5 group cursor-pointer">
          <div className="relative flex items-center justify-center w-11 h-11">
            <div className="absolute inset-0 bg-gradient-to-tr from-violet via-fuchsia-500 to-cyan-400 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            <div className="relative w-11 h-11 bg-gradient-to-br from-violet to-violetDeep rounded-xl flex items-center justify-center shadow-lg border border-white/10 group-hover:scale-105 transition-transform duration-300">
              <span className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-violet-200 text-2xl">L</span>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 font-display font-bold text-2xl tracking-wide leading-none group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-300">LOOP</div>
            <div className="text-cyan-400/80 text-[10px] font-semibold tracking-[0.25em] mt-1 uppercase group-hover:text-cyan-300 transition-colors duration-300">Intelligence</div>
          </div>
        </div>

        <nav className="px-4 mt-6 flex flex-col gap-1.5 relative z-10">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname?.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active ? "bg-violet/15 text-violet border border-violet/20 shadow-soft" : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-5 border-t border-white/5 relative z-10">
          <div className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4 uppercase tracking-wider">
            Northwind Analytics
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2.5 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <div className="flex items-center justify-end px-8 py-4 border-b border-slate-200/60 bg-surface/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3 bg-surface border border-slate-200/60 shadow-soft rounded-xl px-3 py-1.5 transition-shadow hover:shadow-float">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-violet to-violetDeep text-white text-xs font-bold flex items-center justify-center shadow-soft">
              {name[0]}
            </span>
            <div className="pr-2">
              <div className="text-xs font-semibold text-ink leading-none">{name}</div>
              <div className="text-[10px] font-medium text-slate-soft mt-0.5">{role}</div>
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
