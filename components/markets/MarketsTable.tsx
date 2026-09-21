"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AssetTicker } from "@/lib/types";
import { formatPrice, formatUsd } from "@/lib/format";
import { useWatchlist } from "@/components/watchlist/WatchlistProvider";
import { PctBadge } from "@/components/ui/Badge";
import { WatchlistStarButton } from "@/components/watchlist/WatchlistStarButton";
import { PriceFlash } from "@/components/ui/PriceFlash";
import { useLiveTickers } from "@/lib/hooks/useLiveTickers";

type FilterTab = "all" | "gainers" | "losers" | "trending" | "volume" | "watchlist";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "gainers", label: "Gainers" },
  { key: "losers", label: "Losers" },
  { key: "trending", label: "Trending" },
  { key: "volume", label: "High Volume" },
  { key: "watchlist", label: "Watchlist" },
];

export function MarketsTable({ assets }: { assets: AssetTicker[] }) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const { symbols: watchedSymbols, hydrated } = useWatchlist();
  const liveTickers = useLiveTickers();

  const filtered = useMemo(() => {
    let list = assets.filter(
      (a) =>
        a.symbol.toLowerCase().includes(query.toLowerCase()) ||
        a.name.toLowerCase().includes(query.toLowerCase())
    );

    switch (tab) {
      case "gainers":
        list = list.filter((a) => a.change24hPct > 0);
        list.sort((a, b) => b.change24hPct - a.change24hPct);
        break;
      case "losers":
        list = list.filter((a) => a.change24hPct < 0);
        list.sort((a, b) => a.change24hPct - b.change24hPct);
        break;
      case "trending":
        list.sort(
          (a, b) => Math.abs(b.change24hPct) - Math.abs(a.change24hPct)
        );
        break;
      case "volume":
        list.sort((a, b) => b.volume24h - a.volume24h);
        break;
      case "watchlist":
        list = hydrated ? list.filter((a) => watchedSymbols.includes(a.symbol)) : [];
        break;
      default:
        break;
    }

    return list;
  }, [assets, query, tab, watchedSymbols, hydrated]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by symbol or name..."
          className="w-full sm:w-72 rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary placeholder:text-tl-text-muted focus:outline-none focus:border-tl-accent"
        />
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                tab === t.key
                  ? "bg-tl-accent text-black border-tl-accent"
                  : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-tl-border bg-tl-bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-tl-text-muted border-b border-tl-border">
              <th className="px-4 py-3 font-medium w-8"></th>
              <th className="px-4 py-3 font-medium">Asset</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">24H</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Volume</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Market Cap</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">High</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Low</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Volatility</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tl-border">
            {filtered.map((asset) => {
              const live = liveTickers?.get(asset.symbol);
              const price = live?.price ?? asset.price;
              const changePct = live?.change24hPct ?? asset.change24hPct;
              const volume24h = live?.volume24h ?? asset.volume24h;
              return (
              <tr key={asset.symbol} className="transition-colors duration-150 hover:bg-white/[0.04]">
                <td className="px-4 py-3">
                  <WatchlistStarButton symbol={asset.symbol} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/markets/${asset.symbol}`} className="block">
                    <div className="font-medium text-tl-text-primary">
                      {asset.symbol}
                    </div>
                    <div className="text-xs text-tl-text-muted">
                      {asset.name}
                    </div>
                  </Link>
                </td>
                <td className="px-4 py-3 tabular-nums text-tl-text-primary">
                  <PriceFlash price={price} />
                </td>
                <td className="px-4 py-3">
                  <PctBadge value={changePct} />
                </td>
                <td className="px-4 py-3 tabular-nums text-tl-text-secondary hidden md:table-cell">
                  {formatUsd(volume24h)}
                </td>
                <td className="px-4 py-3 tabular-nums text-tl-text-secondary hidden lg:table-cell">
                  {formatUsd(asset.marketCap)}
                </td>
                <td className="px-4 py-3 tabular-nums text-tl-text-secondary hidden lg:table-cell">
                  {formatPrice(asset.high24h)}
                </td>
                <td className="px-4 py-3 tabular-nums text-tl-text-secondary hidden lg:table-cell">
                  {formatPrice(asset.low24h)}
                </td>
                <td className="px-4 py-3 tabular-nums text-tl-text-secondary hidden md:table-cell">
                  {asset.volatility24hPct.toFixed(1)}%
                </td>
              </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-tl-text-muted"
                >
                  {tab === "watchlist"
                    ? "Your watchlist is empty. Tap the star on any asset to add it."
                    : "No assets match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
