import { UnknownAssetError } from "@/lib/errors";

export interface TrackedAsset {
  symbol: string;
  name: string;
  coingeckoId: string;
  binancePair: string;
}

// The fixed set of assets TradingLegends tracks in Phase 2. Extending this
// list is enough to add a new asset everywhere (dashboard, markets, watchlist).
export const TRACKED_ASSETS: TrackedAsset[] = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin", binancePair: "BTCUSDT" },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum", binancePair: "ETHUSDT" },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana", binancePair: "SOLUSDT" },
  { symbol: "LINK", name: "Chainlink", coingeckoId: "chainlink", binancePair: "LINKUSDT" },
  { symbol: "AVAX", name: "Avalanche", coingeckoId: "avalanche-2", binancePair: "AVAXUSDT" },
  { symbol: "XRP", name: "XRP", coingeckoId: "ripple", binancePair: "XRPUSDT" },
  { symbol: "DOGE", name: "Dogecoin", coingeckoId: "dogecoin", binancePair: "DOGEUSDT" },
  { symbol: "ADA", name: "Cardano", coingeckoId: "cardano", binancePair: "ADAUSDT" },
];

export function findTrackedAsset(symbol: string): TrackedAsset {
  const asset = TRACKED_ASSETS.find(
    (a) => a.symbol.toLowerCase() === symbol.toLowerCase()
  );
  if (!asset) {
    throw new UnknownAssetError(symbol);
  }
  return asset;
}
