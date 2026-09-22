import { Candle, Timeframe } from "@/lib/types";

const BINANCE_BASE_URL = "https://api.binance.com/api/v3";

const TIMEFRAME_TO_INTERVAL: Record<Timeframe, string> = {
  // Binance has no 15s/30s kline interval — these two are never actually
  // requested through this REST path. The coin page intercepts them and
  // builds live candles client-side from the raw trade stream instead (see
  // lib/hooks/useLiveCandles.ts). Mapped to "1s" here only so this record
  // stays exhaustively typed.
  "15s": "1s",
  "30s": "1s",
  "1m": "1m",
  "3m": "3m",
  "5m": "5m",
  "15m": "15m",
  "1H": "1h",
  "4H": "4h",
  "1D": "1d",
  "1W": "1w",
};

// [openTime, open, high, low, close, volume, closeTime, quoteAssetVolume,
//  numberOfTrades, takerBuyBaseAssetVolume, takerBuyQuoteAssetVolume, ignore]
type BinanceKline = [
  number, string, string, string, string, string,
  number, string, number, string, string, string
];

export async function fetchBinanceKlines(
  pair: string,
  timeframe: Timeframe,
  limit = 200
): Promise<Candle[]> {
  const interval = TIMEFRAME_TO_INTERVAL[timeframe];
  const res = await fetch(
    `${BINANCE_BASE_URL}/klines?symbol=${pair}&interval=${interval}&limit=${limit}`,
    { next: { revalidate: 30 } }
  );

  if (!res.ok) {
    throw new Error(`Binance request failed: ${res.status} ${pair} ${interval}`);
  }

  const raw = (await res.json()) as BinanceKline[];

  return raw.map((k) => ({
    time: Math.floor(k[0] / 1000),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
    takerBuyVolume: Number(k[9]),
  }));
}
