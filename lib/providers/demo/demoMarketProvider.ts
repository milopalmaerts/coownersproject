import { MarketProvider } from "@/lib/providers/types";
import { AssetTicker, Candle, GlobalStats, Timeframe } from "@/lib/types";
import { UnknownAssetError } from "@/lib/errors";
import {
  DEMO_ASSETS,
  DEMO_BTC_DOMINANCE_PCT,
  DEMO_TOTAL_MARKET_CAP,
  DEMO_TOTAL_VOLUME_24H,
} from "@/lib/providers/demo/demoData";

function findAsset(symbol: string): AssetTicker {
  const asset = DEMO_ASSETS.find(
    (a) => a.symbol.toLowerCase() === symbol.toLowerCase()
  );
  if (!asset) {
    throw new UnknownAssetError(symbol);
  }
  return asset;
}

function timeframeToSeconds(timeframe: Timeframe): number {
  switch (timeframe) {
    case "1m":
      return 60;
    case "5m":
      return 5 * 60;
    case "15m":
      return 15 * 60;
    case "1H":
      return 60 * 60;
    case "4H":
      return 4 * 60 * 60;
    case "1D":
      return 24 * 60 * 60;
    case "1W":
      return 7 * 24 * 60 * 60;
  }
}

// Deterministic pseudo-random generator so demo charts are stable per symbol/timeframe.
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function hashSymbol(symbol: string): number {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash << 5) - hash + symbol.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) || 1;
}

export class DemoMarketProvider implements MarketProvider {
  async getPrice(symbol: string): Promise<number> {
    return findAsset(symbol).price;
  }

  async getTicker(symbol: string): Promise<AssetTicker> {
    return findAsset(symbol);
  }

  async getTickers(symbols: string[]): Promise<AssetTicker[]> {
    return symbols.map((s) => findAsset(s));
  }

  async getAllTickers(): Promise<AssetTicker[]> {
    return DEMO_ASSETS;
  }

  async getHistoricalData(symbol: string, timeframe: Timeframe): Promise<Candle[]> {
    const asset = findAsset(symbol);
    const stepSeconds = timeframeToSeconds(timeframe);
    const points = 120;
    const now = Math.floor(Date.now() / 1000);
    const rand = seededRandom(hashSymbol(symbol) + stepSeconds);

    let price = asset.price * (1 - asset.change24hPct / 200);
    const candles: Candle[] = [];

    for (let i = points; i >= 0; i--) {
      const time = now - i * stepSeconds;
      const drift = (rand() - 0.48) * (asset.volatility24hPct / 100) * price * 0.05;
      const open = price;
      const close = Math.max(open + drift, 0.0001);
      const high = Math.max(open, close) * (1 + rand() * 0.004);
      const low = Math.min(open, close) * (1 - rand() * 0.004);
      const volume = (asset.volume24h / points) * (0.5 + rand());

      candles.push({ time, open, high, low, close, volume });
      price = close;
    }

    return candles;
  }

  async getGlobalStats(): Promise<GlobalStats> {
    return {
      totalMarketCap: DEMO_TOTAL_MARKET_CAP,
      btcDominancePct: DEMO_BTC_DOMINANCE_PCT,
      totalVolume24h: DEMO_TOTAL_VOLUME_24H,
    };
  }
}
