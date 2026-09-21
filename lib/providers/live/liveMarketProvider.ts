import { MarketProvider } from "@/lib/providers/types";
import { AssetTicker, Candle, GlobalStats, Timeframe } from "@/lib/types";
import { fetchCoinGeckoGlobal, fetchCoinGeckoMarkets } from "@/lib/providers/live/coingecko";
import { fetchBinanceKlines } from "@/lib/providers/live/binance";
import { findTrackedAsset, TRACKED_ASSETS } from "@/lib/providers/live/symbolMap";

// CoinGecko supplies price / market cap / volume / dominance (data Binance's
// public API does not expose). Binance supplies fast, high-rate-limit candle
// data for charts. Failures propagate to the caller rather than falling back
// to demo data — a live site must never show demo numbers as if they were
// real. Pages surface these via error.tsx / notFound().
export class LiveMarketProvider implements MarketProvider {
  private async buildTicker(symbol: string): Promise<AssetTicker> {
    const asset = findTrackedAsset(symbol);
    const markets = await fetchCoinGeckoMarkets([asset.coingeckoId]);
    const entry = markets.get(asset.coingeckoId);

    if (!entry) {
      throw new Error(`CoinGecko returned no data for ${asset.coingeckoId}`);
    }

    const volatility24hPct =
      entry.current_price > 0
        ? ((entry.high_24h - entry.low_24h) / entry.current_price) * 100
        : 0;

    return {
      symbol: asset.symbol,
      name: asset.name,
      price: entry.current_price,
      change24hPct: entry.price_change_percentage_24h ?? 0,
      volume24h: entry.total_volume,
      marketCap: entry.market_cap,
      high24h: entry.high_24h,
      low24h: entry.low_24h,
      volatility24hPct,
    };
  }

  async getPrice(symbol: string): Promise<number> {
    const ticker = await this.buildTicker(symbol);
    return ticker.price;
  }

  async getTicker(symbol: string): Promise<AssetTicker> {
    return this.buildTicker(symbol);
  }

  async getTickers(symbols: string[]): Promise<AssetTicker[]> {
    const assets = symbols.map((s) => findTrackedAsset(s));
    const markets = await fetchCoinGeckoMarkets(assets.map((a) => a.coingeckoId));

    return assets.map((asset) => {
      const entry = markets.get(asset.coingeckoId);
      if (!entry) {
        throw new Error(`CoinGecko returned no data for ${asset.coingeckoId}`);
      }
      const volatility24hPct =
        entry.current_price > 0
          ? ((entry.high_24h - entry.low_24h) / entry.current_price) * 100
          : 0;
      return {
        symbol: asset.symbol,
        name: asset.name,
        price: entry.current_price,
        change24hPct: entry.price_change_percentage_24h ?? 0,
        volume24h: entry.total_volume,
        marketCap: entry.market_cap,
        high24h: entry.high_24h,
        low24h: entry.low_24h,
        volatility24hPct,
      };
    });
  }

  async getAllTickers(): Promise<AssetTicker[]> {
    return this.getTickers(TRACKED_ASSETS.map((a) => a.symbol));
  }

  async getHistoricalData(symbol: string, timeframe: Timeframe): Promise<Candle[]> {
    const asset = findTrackedAsset(symbol);
    return fetchBinanceKlines(asset.binancePair, timeframe);
  }

  async getGlobalStats(): Promise<GlobalStats> {
    return fetchCoinGeckoGlobal();
  }
}
