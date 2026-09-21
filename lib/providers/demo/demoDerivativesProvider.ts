import { DerivativesProvider } from "@/lib/providers/types";
import { DerivativesStats, LiquidationSummary } from "@/lib/types";

const DEMO_LIQUIDATIONS: LiquidationSummary[] = [
  {
    symbol: "BTC",
    windowLabel: "LAST 1H",
    longUsd: 42_400_000,
    shortUsd: 18_700_000,
    totalUsd: 61_100_000,
    largestUsd: 3_200_000,
    largestSide: "long",
  },
  {
    symbol: "ETH",
    windowLabel: "LAST 1H",
    longUsd: 11_200_000,
    shortUsd: 9_800_000,
    totalUsd: 21_000_000,
    largestUsd: 1_100_000,
    largestSide: "short",
  },
  {
    symbol: "SOL",
    windowLabel: "LAST 1H",
    longUsd: 3_400_000,
    shortUsd: 2_100_000,
    totalUsd: 5_500_000,
    largestUsd: 480_000,
    largestSide: "long",
  },
];

// fundingRatePct is already a percentage value (e.g. 0.0102 means 0.0102%),
// matching the live Hyperliquid provider's convention.
const DEMO_FUNDING_RATES: DerivativesStats[] = [
  { symbol: "BTC", fundingRatePct: 0.0102, openInterest: 18_400_000_000 },
  { symbol: "ETH", fundingRatePct: 0.0081, openInterest: 8_100_000_000 },
  { symbol: "SOL", fundingRatePct: -0.0043, openInterest: 1_900_000_000 },
];

export class DemoDerivativesProvider implements DerivativesProvider {
  async getLiquidations(symbol?: string): Promise<LiquidationSummary[]> {
    if (!symbol) return DEMO_LIQUIDATIONS;
    return DEMO_LIQUIDATIONS.filter(
      (l) => l.symbol.toLowerCase() === symbol.toLowerCase()
    );
  }

  async getFundingRates(): Promise<DerivativesStats[]> {
    return DEMO_FUNDING_RATES;
  }

  async getOpenInterest(): Promise<DerivativesStats[]> {
    return DEMO_FUNDING_RATES;
  }
}
