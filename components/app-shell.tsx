"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard, Inbox, TrendingUp, MessageSquare, FileText, LogOut, Menu, X
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inbox",     label: "Inbox",     icon: Inbox },
  { href: "/trends",    label: "Trends",    icon: TrendingUp },
  { href: "/ask",       label: "Ask LOOP",  icon: MessageSquare },
  { href: "/reports",   label: "Reports",   icon: FileText },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role ?? "VIEWER";
  const name = session?.user?.name ?? "…";
  const [drawerOpen, setDrawerOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Brand Lockup */}
      <div className="flex items-center gap-3.5 px-7 pt-10 pb-8 relative z-10 group cursor-pointer">
        <div className="relative flex items-center justify-center w-10 h-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 via-accent-cyan to-accent-emerald rounded-xl blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500" />
          <div className="relative w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-glow border border-white/10">
            <span className="font-display font-bold text-white text-xl tracking-tighter">L</span>
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-white font-display font-semibold text-xl tracking-wide leading-none">LOOP</div>
          <div className="text-primary-400 text-[9px] font-semibold tracking-[0.25em] mt-1.5 uppercase">Intelligence</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-5 mt-4 flex flex-col gap-1.5 relative z-10">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = pathname?.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-300 relative ${
                active
                  ? "text-white bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              )}
              <Icon size={18} strokeWidth={active ? 2.5 : 2} className={active ? "text-primary-400" : "text-slate-500"} />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="mt-auto px-5 pb-6 pt-5 relative z-10">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.05] transition-all duration-300">
          <div className="text-[10px] text-slate-500 font-semibold mb-3 uppercase tracking-wider">Workspace</div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center font-bold text-xs border border-primary-500/20">
              {name[0]}
            </div>
            <div>
              <div className="text-sm font-medium text-slate-200">{name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wide">{role}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-white text-[11px] font-semibold py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-paper font-sans relative selection:bg-primary-500/30">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden lg:ml-[260px] opacity-60">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute top-[30%] -left-[10%] w-[600px] h-[600px] bg-accent-cyan/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] right-[20%] w-[700px] h-[700px] bg-accent-emerald/5 rounded-full blur-[120px]" />
      </div>

      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className="hidden lg:flex w-[260px] bg-ink flex-col shrink-0 relative overflow-hidden shadow-2xl z-30 border-r border-white/5">
        <div className="absolute top-0 -left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-[280px] bg-ink flex flex-col z-50 shadow-2xl border-r border-white/5 transition-transform duration-300 ease-in-out lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute top-0 -left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-8 py-3 md:py-4 sticky top-0 z-20 backdrop-blur-xl bg-paper/70 border-b border-slate-200/50 gap-3">
          {/* Hamburger (mobile only) */}
          <button
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/60 border border-slate-200/60 shadow-sm text-slate-600 hover:text-primary-600 hover:bg-white transition-colors flex-shrink-0"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={18} />
          </button>

          {/* Page title shown on mobile instead of search */}
          <div className="lg:hidden font-display font-bold text-ink text-lg flex-1">
            {NAV.find(n => pathname?.startsWith(n.href))?.label ?? "LOOP"}
          </div>

          {/* Search (desktop only) */}
          <div className="hidden lg:flex flex-1 items-center max-w-md">
            <div className="relative w-full">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search feedback, customers, reports..."
                className="w-full pl-10 pr-4 py-2 bg-white/50 border border-slate-200/60 rounded-full text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden md:flex flex-col items-end">
              <div className="text-[13px] font-semibold text-ink leading-tight">{name}</div>
              <div className="text-[10px] font-medium text-slate-muted uppercase tracking-wider mt-0.5">{role}</div>
            </div>
            <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-cyan rounded-full blur opacity-40 group-hover:opacity-70 transition-opacity" />
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-[13px] font-bold flex items-center justify-center shadow-soft relative border-2 border-surface">
                {name[0]}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 animate-fade-in pb-20 lg:pb-12">
          {children}
        </main>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 flex items-center justify-around px-2 py-2 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = pathname?.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                  active ? "text-primary-600" : "text-slate-400"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-wide">{n.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
