// Shared with app/(app)/whales/page.tsx's displayed threshold tiers — the
// top tier per asset is treated as "mega whale" for visual emphasis
// (glow + badge) anywhere a transaction list is rendered.
export const WHALE_THRESHOLDS: Record<string, number[]> = {
  BTC: [1_000_000, 5_000_000, 10_000_000],
  ETH: [500_000, 1_000_000, 5_000_000],
};

export function isMegaWhale(symbol: string, usdValue: number): boolean {
  const tiers = WHALE_THRESHOLDS[symbol];
  const megaTier = tiers ? tiers[tiers.length - 1] : 10_000_000;
  return usdValue >= megaTier;
}
