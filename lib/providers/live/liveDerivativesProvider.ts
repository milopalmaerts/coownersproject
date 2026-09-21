import { DerivativesProvider } from "@/lib/providers/types";
import { DerivativesStats, LiquidationSummary } from "@/lib/types";
import { fetchHyperliquidStats } from "@/lib/providers/live/hyperliquid";
import { TRACKED_ASSETS } from "@/lib/providers/live/symbolMap";

const TRACKED_SYMBOLS = new Set(TRACKED_ASSETS.map((a) => a.symbol));

// Funding rates and open interest are real, from Hyperliquid's public Info
// API (no key). Aggregate liquidations have no free periodic/REST source
// (Hyperliquid has no exchange-wide liquidation feed; Binance's equivalent
// is WebSocket-only, which doesn't fit a server-rendered page) — see the
// live client-side ticker on the Liquidations page instead. This provider
// returns an empty list here rather than inventing numbers.
export class LiveDerivativesProvider implements DerivativesProvider {
  private async getStats(): Promise<DerivativesStats[]> {
    const stats = await fetchHyperliquidStats();
    return stats
      .filter((s) => TRACKED_SYMBOLS.has(s.symbol))
      .map((s) => ({
        symbol: s.symbol,
        fundingRatePct: s.fundingRatePct,
        openInterest: s.openInterestUsd,
      }));
  }

  async getFundingRates(): Promise<DerivativesStats[]> {
    return this.getStats();
  }

  async getOpenInterest(): Promise<DerivativesStats[]> {
    return this.getStats();
  }

  async getLiquidations(): Promise<LiquidationSummary[]> {
    return [];
  }
}
