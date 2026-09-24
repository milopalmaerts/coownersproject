"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TRACKED_ASSETS } from "@/lib/providers/live/symbolMap";

interface PaletteItem {
  id: string;
  label: string;
  sublabel?: string;
  icon: string;
  href: string;
  keywords: string;
}

const PAGE_ITEMS: PaletteItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊", href: "/dashboard", keywords: "home overview" },
  { id: "markets", label: "Markets", icon: "📈", href: "/markets", keywords: "table prices" },
  { id: "heatmap", label: "Heatmap", icon: "🔥", href: "/heatmap", keywords: "treemap performance overview" },
  { id: "scanner", label: "Scanner", icon: "🔎", href: "/scanner", keywords: "confluence signals divergence whale funding" },
  { id: "news", label: "News", icon: "📰", href: "/news", keywords: "headlines" },
  { id: "calendar", label: "Economic Calendar", icon: "🗓️", href: "/news?view=calendar", keywords: "fomc cpi nfp events" },
  { id: "whales", label: "Whale Alerts", icon: "🐋", href: "/whales", keywords: "large transactions" },
  { id: "liquidations", label: "Liquidations", icon: "⚡", href: "/liquidations", keywords: "funding open interest" },
  { id: "watchlist", label: "Watchlist", icon: "⭐", href: "/watchlist", keywords: "saved favorites" },
  { id: "journal", label: "Journal", icon: "📓", href: "/journal", keywords: "trades r-multiple psychology review" },
  { id: "portfolio", label: "Portfolio", icon: "💼", href: "/portfolio", keywords: "holdings pnl profit loss" },
  { id: "predictions", label: "Predictions", icon: "🎯", href: "/predictions", keywords: "calls thesis public" },
  { id: "track-record", label: "Track Record", icon: "✅", href: "/track-record", keywords: "win rate alerts history verified" },
  { id: "discord", label: "Discord", icon: "💬", href: "/discord", keywords: "community bot" },
  { id: "docs", label: "API Docs", icon: "📄", href: "/docs", keywords: "api endpoints public developer" },
  { id: "settings", label: "Settings", icon: "⚙️", href: "/settings", keywords: "configuration status" },
];

const COIN_ITEMS: PaletteItem[] = TRACKED_ASSETS.map((asset) => ({
  id: `coin-${asset.symbol}`,
  label: asset.symbol,
  sublabel: asset.name,
  icon: "🪙",
  href: `/markets/${asset.symbol}`,
  keywords: `${asset.symbol} ${asset.name}`.toLowerCase(),
}));

const ALL_ITEMS = [...PAGE_ITEMS, ...COIN_ITEMS];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_ITEMS.slice(0, 8);
    return ALL_ITEMS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) || item.keywords.includes(q)
    ).slice(0, 8);
  }, [query]);

  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    function handleOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    window.addEventListener("open-command-palette", handleOpenEvent);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
      window.removeEventListener("open-command-palette", handleOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const select = (item: PaletteItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results[activeIndex]) select(results[activeIndex]);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-xl border border-tl-border bg-tl-bg-elevated shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 border-b border-tl-border">
          <span className="text-tl-text-muted">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jump to a page or coin…"
            className="flex-1 bg-transparent py-3 text-sm text-tl-text-primary placeholder:text-tl-text-muted focus:outline-none"
          />
          <kbd className="text-xs text-tl-text-muted border border-tl-border rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-2">
          {results.length === 0 ? (
            <li className="px-4 py-6 text-sm text-tl-text-muted text-center">
              No matches.
            </li>
          ) : (
            results.map((item, index) => (
              <li key={item.id}>
                <button
                  onClick={() => select(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
                    index === activeIndex
                      ? "bg-tl-accent/10 text-tl-accent"
                      : "text-tl-text-secondary hover:bg-white/5"
                  }`}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  <span className="flex-1">
                    <span className="text-tl-text-primary">{item.label}</span>
                    {item.sublabel && (
                      <span className="text-tl-text-muted ml-2">{item.sublabel}</span>
                    )}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
