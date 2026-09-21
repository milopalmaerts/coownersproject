import {
  AssetTicker,
  Candle,
  DerivativesStats,
  EconomicEvent,
  GlobalStats,
  LiquidationSummary,
  NewsItem,
  Timeframe,
  WhaleTransaction,
} from "@/lib/types";

export interface MarketProvider {
  getPrice(symbol: string): Promise<number>;
  getTicker(symbol: string): Promise<AssetTicker>;
  getTickers(symbols: string[]): Promise<AssetTicker[]>;
  getAllTickers(): Promise<AssetTicker[]>;
  getHistoricalData(symbol: string, timeframe: Timeframe): Promise<Candle[]>;
  getGlobalStats(): Promise<GlobalStats>;
}

export interface NewsProvider {
  getLatestNews(limit?: number): Promise<NewsItem[]>;
  getNewsBySymbol(symbol: string, limit?: number): Promise<NewsItem[]>;
}

export interface WhaleProvider {
  getLargeTransactions(limit?: number): Promise<WhaleTransaction[]>;
  getLargeTransactionsBySymbol(symbol: string, limit?: number): Promise<WhaleTransaction[]>;
}

export interface DerivativesProvider {
  getLiquidations(symbol?: string): Promise<LiquidationSummary[]>;
  getFundingRates(): Promise<DerivativesStats[]>;
  getOpenInterest(): Promise<DerivativesStats[]>;
}

export interface EconomicCalendarProvider {
  getEvents(): Promise<EconomicEvent[]>;
}

export interface DataMode {
  isDemo: boolean;
}
