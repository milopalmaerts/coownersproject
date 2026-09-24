import Link from "next/link";
import { derivativesProvider, marketProvider, whaleProvider } from "@/lib/providers";
import { TRACKED_ASSETS } from "@/lib/providers/live/symbolMap";
import { computeCvdSeries, detectDivergences } from "@/lib/cvd";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const SCANNER_TIMEFRAME = "5m" as const;
// Funding rates outside +-0.01%/8h are unusually stretched for majors —
// a rough, fixed threshold rather than a rolling percentile, so it's at
// least consistent and explainable.
const EXTREME_FUNDING_THRESHOLD = 0.01;

interface AssetSignals {
  symbol: string;
  name: string;
  cvdDivergence: "bullish" | "bearish" | null;
  hasWhaleActivity: boolean;
  extremeFunding: boolean;
  fundingRatePct: number | null;
  score: number;
}

export default async function ScannerPage() {
  const [funding, ...perAsset] = await Promise.all([
    derivativesProvider.getFundingRates().catch(() => []),
    ...TRACKED_ASSETS.map(async (asset) => {
      const [candles, whaleTxs] = await Promise.all([
        marketProvider.getHistoricalData(asset.symbol, SCANNER_TIMEFRAME).catch(() => []),
        whaleProvider.getLargeTransactionsBySymbol(asset.symbol, 3).catch(() => []),
      ]);
      return { symbol: asset.symbol, candles, whaleTxs };
    }),
  ]);

  const signals: AssetSignals[] = TRACKED_ASSETS.map((asset) => {
    const data = perAsset.find((p) => p.symbol === asset.symbol);
    const candles = data?.candles ?? [];
    const cvd = candles.length > 0 ? computeCvdSeries(candles) : [];
    const divergences = candles.length > 0 ? detectDivergences(candles, cvd) : [];
    const mostRecentDivergence = divergences[divergences.length - 1]?.type ?? null;

    const symbolFunding = funding.find((f) => f.symbol === asset.symbol);
    const extremeFunding = symbolFunding
      ? Math.abs(symbolFunding.fundingRatePct) >= EXTREME_FUNDING_THRESHOLD
      : false;

    const hasWhaleActivity = (data?.whaleTxs.length ?? 0) > 0;

    const score = (mostRecentDivergence ? 1 : 0) + (hasWhaleActivity ? 1 : 0) + (extremeFunding ? 1 : 0);

    return {
      symbol: asset.symbol,
      name: asset.name,
      cvdDivergence: mostRecentDivergence,
      hasWhaleActivity,
      extremeFunding,
      fundingRatePct: symbolFunding?.fundingRatePct ?? null,
      score,
    };
  }).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 11 · Confluence Scanner</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Scanner</h1>
        <p className="text-sm text-tl-text-secondary">
          All tracked assets, checked for signals happening at the same
          time: a CVD divergence on the {SCANNER_TIMEFRAME} chart, recent
          whale activity, and a stretched funding rate. More simultaneous
          signals isn&apos;t a guarantee of anything — it just means more is
          going on right now, worth a closer look.
        </p>
      </div>

      <ScrollReveal>
        <Card>
          <CardHeader title="Signal Confluence" />
          <ul className="divide-y divide-tl-border">
            {signals.map((s) => (
              <li key={s.symbol} className="py-3 flex items-center justify-between gap-3">
                <Link href={`/markets/${s.symbol}`} className="flex items-center gap-3 min-w-0">
                  <span className="font-semibold text-tl-text-primary tl-mono">{s.symbol}</span>
                  <span className="text-xs text-tl-text-muted truncate">{s.name}</span>
                </Link>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {s.cvdDivergence && (
                    <Badge tone={s.cvdDivergence === "bullish" ? "positive" : "negative"}>
                      CVD {s.cvdDivergence}
                    </Badge>
                  )}
                  {s.hasWhaleActivity && <Badge tone="warning">Whale activity</Badge>}
                  {s.extremeFunding && s.fundingRatePct !== null && (
                    <Badge tone="info">Funding {s.fundingRatePct.toFixed(3)}%</Badge>
                  )}
                  {s.score === 0 && <Badge tone="neutral">No signals</Badge>}
                  <span className="tl-mono text-xs text-tl-text-muted w-10 text-right">
                    {s.score}/3
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </ScrollReveal>
    </div>
  );
}
