export type Timeframe = "15s" | "30s" | "1m" | "3m" | "5m" | "15m" | "1H" | "4H" | "1D" | "1W";

export interface AssetTicker {
  symbol: string;
  name: string;
  price: number;
  change24hPct: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  volatility24hPct: number;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Taker buy volume within this candle (same units as `volume`) — lets us
  // approximate net buy/sell pressure (CVD) without a raw trade feed.
  // Optional: not every provider/mode can supply it.
  takerBuyVolume?: number;
}

export interface GlobalStats {
  totalMarketCap: number;
  btcDominancePct: number;
  totalVolume24h: number;
}

export interface DerivativesStats {
  symbol: string;
  fundingRatePct: number;
  openInterest: number;
}

export type NewsCategory =
  | "Bitcoin"
  | "Ethereum"
  | "Altcoins"
  | "DeFi"
  | "Regulation"
  | "Security"
  | "Markets"
  | "Macro"
  | "NFT";

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string; // ISO
  relatedSymbols: string[];
  category: NewsCategory;
}

export type WhaleDirection = "wallet" | "exchange" | "unknown";

export interface WhaleTransaction {
  id: string;
  symbol: string;
  usdValue: number;
  fromLabel: string;
  toLabel: string;
  fromType: WhaleDirection;
  toType: WhaleDirection;
  timestamp: string; // ISO
  txUrl: string;
}

export interface LiquidationSummary {
  symbol: string;
  windowLabel: string; // e.g. "LAST 1H"
  longUsd: number;
  shortUsd: number;
  totalUsd: number;
  largestUsd: number;
  largestSide: "long" | "short";
}

export type EventImpact = "Low" | "Medium" | "High";

export interface EconomicEvent {
  id: string;
  title: string;
  country: string; // currency/country code, e.g. "USD", "All"
  date: string; // ISO
  impact: EventImpact;
  forecast: string;
  previous: string;
}

export type LiveAlertKind =
  | "PRICE_ALERT"
  | "VOLUME_ALERT"
  | "WHALE_ALERT"
  | "NEWS_ALERT"
  | "LIQUIDATION_ALERT"
  | "VOLATILITY_ALERT";

export interface LiveAlert {
  id: string;
  kind: LiveAlertKind;
  message: string;
  symbol?: string;
  timestamp: string; // ISO
  severity: "info" | "positive" | "negative" | "warning";
}
