"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/markets", label: "Markets", icon: "📈" },
  { href: "/heatmap", label: "Heatmap", icon: "🔥" },
  { href: "/scanner", label: "Scanner", icon: "🔎" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/whales", label: "Whale Alerts", icon: "🐋" },
  { href: "/liquidations", label: "Liquidations", icon: "⚡" },
  { href: "/watchlist", label: "Watchlist", icon: "⭐" },
  { href: "/portfolio", label: "Portfolio", icon: "💼" },
  { href: "/predictions", label: "Predictions", icon: "🎯" },
  { href: "/track-record", label: "Track Record", icon: "✅" },
  { href: "/discord", label: "Discord", icon: "💬" },
  { href: "/docs", label: "API Docs", icon: "📄" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar({ isDemoMode }: { isDemoMode: boolean }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:shrink-0 border-r border-tl-border bg-tl-bg-elevated">
      <Link href="/" className="flex items-center gap-2 px-5 h-16 border-b border-tl-border">
        <span className="text-tl-accent text-xl">◆</span>
        <span className="tl-mono font-semibold tracking-wide text-tl-text-primary">
          TRADING<span className="text-tl-accent">LEGENDS</span>
        </span>
      </Link>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative tl-mono flex items-center gap-3 rounded-md px-3 py-2 text-xs uppercase tracking-wide transition-colors ${
                isActive
                  ? "bg-tl-accent-soft text-tl-accent"
                  : "text-tl-text-secondary hover:bg-white/5 hover:text-tl-text-primary"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 bg-tl-accent" />
              )}
              <span className="w-5 text-center not-italic text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="tl-mono px-4 py-4 border-t border-tl-border text-[11px] text-tl-text-muted flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${isDemoMode ? "bg-tl-warning" : "bg-tl-positive"}`} />
        SYS:{isDemoMode ? "DEMO" : "OK"} · v0.1
      </div>
    </aside>
  );
}
