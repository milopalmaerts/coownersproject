import { AssetTicker, LiveAlert } from "@/lib/types";
import { getLastPriceLevel, setLastPriceLevel } from "@/lib/alerts/redis";
import {
  COLOR_NEGATIVE,
  COLOR_POSITIVE,
  postDiscordEmbed,
} from "@/lib/alerts/discord";

// How finely to bucket each asset's price into "round" levels worth
// announcing (e.g. BTC in $1,000 steps: ...71000, 72000, 73000...).
const LEVEL_INCREMENT: Record<string, number> = {
  BTC: 1000,
  ETH: 100,
};

function levelFor(symbol: string, price: number): number {
  const increment = LEVEL_INCREMENT[symbol];
  return Math.floor(price / increment) * increment;
}

// Fires when the price crosses into a new $-level band, in either
// direction — "BTC broke $72,000" going up, "BTC dropped below $72,000"
// going down. Only announces the level actually reached, not every
// intermediate one skipped during a fast move between checks.
export async function evaluateRoundNumberAlerts(
  tickers: AssetTicker[]
): Promise<LiveAlert[]> {
  const fired: LiveAlert[] = [];

  for (const symbol of Object.keys(LEVEL_INCREMENT)) {
    const ticker = tickers.find((t) => t.symbol === symbol);
    if (!ticker) continue;

    const newLevel = levelFor(symbol, ticker.price);
    const oldLevel = await getLastPriceLevel(symbol);

    if (oldLevel === null) {
      // Cold start — seed without announcing the level we're already at.
      await setLastPriceLevel(symbol, newLevel);
      continue;
    }

    if (newLevel === oldLevel) continue;
    await setLastPriceLevel(symbol, newLevel);

    const isUp = newLevel > oldLevel;
    const announcedLevel = isUp ? newLevel : oldLevel;
    const formattedLevel = `$${announcedLevel.toLocaleString("en-US")}`;

    const alert: LiveAlert = {
      id: `level-${symbol}-${announcedLevel}-${Date.now()}`,
      kind: "PRICE_ALERT",
      message: isUp
        ? `${symbol} broke ${formattedLevel}`
        : `${symbol} dropped below ${formattedLevel}`,
      symbol,
      timestamp: new Date().toISOString(),
      severity: isUp ? "positive" : "negative",
      priceAtFire: ticker.price,
    };
    fired.push(alert);

    await postDiscordEmbed({
      title: `${isUp ? "🚀" : "⚠️"} ${alert.message}`,
      description: `${symbol} is now trading at $${ticker.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}.`,
      color: isUp ? COLOR_POSITIVE : COLOR_NEGATIVE,
      timestamp: alert.timestamp,
    });
  }

  return fired;
}
