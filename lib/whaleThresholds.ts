// Shared with app/(app)/whales/page.tsx's displayed threshold tiers — the
// top tier per asset is treated as "mega whale" for visual emphasis
// (glow + badge) anywhere a transaction list is rendered.
export const WHALE_THRESHOLDS: Record<string, number[]> = {
  BTC: [1_000_000, 5_000_000, 10_000_000],
  ETH: [500_000, 1_000_000, 5_000_000],
  USDT: [500_000, 2_000_000, 10_000_000],
  USDC: [500_000, 2_000_000, 10_000_000],
};

export function isMegaWhale(symbol: string, usdValue: number): boolean {
  const tiers = WHALE_THRESHOLDS[symbol];
  const megaTier = tiers ? tiers[tiers.length - 1] : 10_000_000;
  return usdValue >= megaTier;
}

// A directional read, only when one side is a known exchange wallet and the
// other isn't — an internal exchange-to-exchange transfer or two unknown
// wallets gives no usable signal, so this returns null rather than guessing.
export function getFlowHint(
  fromType: "wallet" | "exchange" | "unknown",
  toType: "wallet" | "exchange" | "unknown"
): { label: string; tone: "positive" | "negative" } | null {
  if (fromType === "exchange" && toType !== "exchange") {
    return { label: "Exchange withdrawal · possible accumulation", tone: "positive" };
  }
  if (toType === "exchange" && fromType !== "exchange") {
    return { label: "Exchange deposit · possible sell pressure", tone: "negative" };
  }
  return null;
}
