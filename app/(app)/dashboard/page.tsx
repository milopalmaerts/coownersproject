import { Suspense } from "react";
import { marketProvider } from "@/lib/providers";
import { formatUsd } from "@/lib/format";
import { PriceCard } from "@/components/dashboard/PriceCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendingList } from "@/components/dashboard/TrendingList";
import { WhaleActivitySection } from "@/components/dashboard/WhaleActivitySection";
import { AlertsFeedSection } from "@/components/dashboard/AlertsFeedSection";
import { HighImpactEventsSection } from "@/components/dashboard/HighImpactEventsSection";
import { LatestNewsSection } from "@/components/dashboard/LatestNewsSection";
import { SkeletonList } from "@/components/ui/Skeleton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function DashboardPage() {
  const [tickers, globalStats] = await Promise.all([
    marketProvider.getAllTickers(),
    marketProvider.getGlobalStats(),
  ]);

  const featured = tickers.filter((t) =>
    ["BTC", "ETH", "SOL"].includes(t.symbol)
  );

  const gainers = tickers
    .filter((t) => t.change24hPct > 0)
    .sort((a, b) => b.change24hPct - a.change24hPct)
    .slice(0, 5);
  const losers = tickers
    .filter((t) => t.change24hPct < 0)
    .sort((a, b) => a.change24hPct - b.change24hPct)
    .slice(0, 5);
  const unusualVolume = [...tickers]
    .sort((a, b) => b.volume24h - a.volume24h)
    .slice(0, 5);
  const trending = [...tickers]
    .sort((a, b) => Math.abs(b.change24hPct) - Math.abs(a.change24hPct))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 01 · Overview</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Dashboard</h1>
        <p className="text-sm text-tl-text-secondary">
          Live overview of markets, whale activity and alerts.
        </p>
      </div>

      <ScrollReveal className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {featured.map((asset) => (
          <PriceCard key={asset.symbol} asset={asset} />
        ))}
      </ScrollReveal>

      <ScrollReveal delay={0.05} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Market Cap" value={formatUsd(globalStats.totalMarketCap)} />
        <StatCard label="BTC Dominance" value={`${globalStats.btcDominancePct.toFixed(1)}%`} />
        <StatCard
          label="24H Volume"
          value={formatUsd(globalStats.totalVolume24h)}
          hint="Across all tracked markets"
        />
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <ScrollReveal delay={0.1}>
            <Suspense fallback={<SkeletonList rows={4} />}>
              <WhaleActivitySection />
            </Suspense>
          </ScrollReveal>

          <ScrollReveal delay={0.15} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TrendingList
              title="Top Gainers"
              assets={gainers}
              emptyMessage="No assets are up right now."
            />
            <TrendingList
              title="Top Losers"
              assets={losers}
              emptyMessage="No assets are down right now."
            />
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TrendingList title="Trending Coins" assets={trending} />
            <TrendingList
              title="Unusual Volume"
              assets={unusualVolume}
              metric="volume"
            />
          </ScrollReveal>
        </div>

        <div className="space-y-4">
          <ScrollReveal delay={0.1}>
            <Suspense fallback={<SkeletonList rows={3} />}>
              <AlertsFeedSection />
            </Suspense>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <Suspense fallback={<SkeletonList rows={3} />}>
              <HighImpactEventsSection />
            </Suspense>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <Suspense fallback={<SkeletonList rows={5} />}>
              <LatestNewsSection />
            </Suspense>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
