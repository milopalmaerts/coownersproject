import { DemoMarketProvider } from "@/lib/providers/demo/demoMarketProvider";
import { DemoNewsProvider } from "@/lib/providers/demo/demoNewsProvider";
import { DemoWhaleProvider } from "@/lib/providers/demo/demoWhaleProvider";
import { DemoDerivativesProvider } from "@/lib/providers/demo/demoDerivativesProvider";
import { DemoEconomicProvider } from "@/lib/providers/demo/demoEconomicProvider";
import { LiveMarketProvider } from "@/lib/providers/live/liveMarketProvider";
import { LiveNewsProvider } from "@/lib/providers/live/liveNewsProvider";
import { LiveEconomicCalendarProvider } from "@/lib/providers/live/economicCalendar";
import { LiveWhaleProvider } from "@/lib/providers/live/liveWhaleProvider";
import { LiveDerivativesProvider } from "@/lib/providers/live/liveDerivativesProvider";

// Market data is live by default: prices/market cap/dominance come from
// CoinGecko, candles from Binance's public API. Neither requires a key —
// CoinGecko's Keyless Public API serves unauthenticated requests (rate
// limited to ~10-30 calls/min, shared per IP). Setting MARKET_API_KEY (a
// free CoinGecko Demo key) switches to the keyed Demo plan for a much higher
// limit (100 calls/min, 10,000/month) — required before real production
// traffic, since CoinGecko states the keyless tier is not meant for that.
//
// News is also live by default: an aggregator over official RSS feeds
// (Cointelegraph, Decrypt, CoinDesk, CryptoSlate — see
// live/newsSources.ts), since the paid crypto news APIs (CryptoPanic,
// CoinDesk Data) dropped their free tiers in 2026.
//
// Whale monitoring is also live by default, scoped to BTC + ETH only (the
// two most-tracked whale assets): BTC via mempool.space (free, no key),
// ETH via Etherscan (free, but requires ETHERSCAN_API_KEY — set on
// etherscan.io/apis). Without that key, ETH detection is silently skipped
// (not an error) and only BTC whales show; other tracked symbols (SOL,
// LINK, AVAX, XRP, DOGE, ADA) have no live whale source yet. Unlike Whale
// Alert, we have no address-labeling database, so transactions are
// reported as "Unknown wallet" on both sides rather than guessed.
//
// Funding rates and open interest are also live by default, from
// Hyperliquid's public Info API (free, no key) — covers all 8 tracked
// assets. Aggregate liquidations have no free periodic data source (see
// liveDerivativesProvider.ts); the Liquidations page uses a live
// client-side WebSocket ticker for that instead of this provider.
//
// Demo data is opt-in only (DEMO_MODE=true), e.g. for offline development.
// We never fall back to it silently — a live site must never show demo
// numbers as if they were real. Swapping any provider out never requires
// touching a page or component, since everything consumes the interfaces
// in lib/providers/types.ts.
export const isDemoMode = process.env.DEMO_MODE === "true";
export const hasMarketApiKey = Boolean(process.env.MARKET_API_KEY);
export const hasEtherscanApiKey = Boolean(process.env.ETHERSCAN_API_KEY);

export const marketProvider = isDemoMode
  ? new DemoMarketProvider()
  : new LiveMarketProvider();
export const newsProvider = isDemoMode
  ? new DemoNewsProvider()
  : new LiveNewsProvider();
export const whaleProvider = isDemoMode
  ? new DemoWhaleProvider()
  : new LiveWhaleProvider();
export const derivativesProvider = isDemoMode
  ? new DemoDerivativesProvider()
  : new LiveDerivativesProvider();
export const economicCalendarProvider = isDemoMode
  ? new DemoEconomicProvider()
  : new LiveEconomicCalendarProvider();
