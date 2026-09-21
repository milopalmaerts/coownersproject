import { derivativesProvider } from "@/lib/providers";
import { LiveLiquidationTicker } from "@/components/liquidations/LiveLiquidationTicker";
import { DerivativesStatsTable } from "@/components/liquidations/DerivativesStatsTable";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function LiquidationsPage() {
  const stats = await derivativesProvider.getFundingRates().catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 05 · Liquidation Flow</p>
        <h1 className="text-xl font-bold text-tl-text-primary">
          Liquidations
        </h1>
        <p className="text-sm text-tl-text-secondary">
          Real-time liquidations and derivatives stats — no historical
          aggregator exists for free, so this is a live feed rather than a
          fixed-window summary.
        </p>
      </div>

      <ScrollReveal className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveLiquidationTicker />
        <DerivativesStatsTable stats={stats} />
      </ScrollReveal>
    </div>
  );
}
