import { AssetTicker, LiveAlert } from "@/lib/types";
import { formatPct } from "@/lib/format";
import {
  getPriceTier,
  PriceTier,
  setPriceTier,
} from "@/lib/alerts/redis";
import {
  COLOR_NEGATIVE,
  COLOR_POSITIVE,
  postDiscordEmbed,
} from "@/lib/alerts/discord";

const TRACKED_SYMBOLS = ["BTC", "ETH"];

const TIER_MAGNITUDE: Record<PriceTier, number> = {
  none: 0,
  up5: 1,
  up10: 2,
  down5: 1,
  down10: 2,
};

const TIER_DIRECTION: Record<PriceTier, -1 | 0 | 1> = {
  none: 0,
  up5: 1,
  up10: 1,
  down5: -1,
  down10: -1,
};

function computeTier(change24hPct: number): PriceTier {
  if (change24hPct >= 10) return "up10";
  if (change24hPct >= 5) return "up5";
  if (change24hPct <= -10) return "down10";
  if (change24hPct <= -5) return "down5";
  return "none";
}

// Fires only when crossing INTO a more extreme threshold (or flipping
// direction) — never on de-escalation, and never repeatedly while the
// price stays in the same band. Prevents spamming Discord every 5 minutes.
function shouldAlert(oldTier: PriceTier, newTier: PriceTier): boolean {
  if (newTier === "none") return false;
  if (TIER_DIRECTION[newTier] !== TIER_DIRECTION[oldTier]) return true;
  return TIER_MAGNITUDE[newTier] > TIER_MAGNITUDE[oldTier];
}

const TIER_LABEL: Record<PriceTier, string> = {
  none: "",
  up5: "+5%",
  up10: "+10%",
  down5: "-5%",
  down10: "-10%",
};

export async function evaluatePriceAlerts(
  tickers: AssetTicker[]
): Promise<LiveAlert[]> {
  const fired: LiveAlert[] = [];

  for (const symbol of TRACKED_SYMBOLS) {
    const ticker = tickers.find((t) => t.symbol === symbol);
    if (!ticker) continue;

    const oldTier = await getPriceTier(symbol);
    const newTier = computeTier(ticker.change24hPct);

    if (newTier !== oldTier) {
      await setPriceTier(symbol, newTier);
    }

    if (shouldAlert(oldTier, newTier)) {
      const isUp = TIER_DIRECTION[newTier] === 1;
      const alert: LiveAlert = {
        id: `price-${symbol}-${newTier}-${Date.now()}`,
        kind: "PRICE_ALERT",
        message: `${symbol} ${isUp ? "up" : "down"} ${TIER_LABEL[newTier].replace(/[+-]/, "")} (24h: ${formatPct(ticker.change24hPct)})`,
        symbol,
        timestamp: new Date().toISOString(),
        severity: isUp ? "positive" : "negative",
        priceAtFire: ticker.price,
      };
      fired.push(alert);

      await postDiscordEmbed({
        title: `${isUp ? "📈" : "📉"} ${symbol} ${TIER_LABEL[newTier]} in 24h`,
        description: `${symbol} is now ${formatPct(ticker.change24hPct)} over the last 24 hours.`,
        color: isUp ? COLOR_POSITIVE : COLOR_NEGATIVE,
        timestamp: alert.timestamp,
      });
    }
  }

  return fired;
}
