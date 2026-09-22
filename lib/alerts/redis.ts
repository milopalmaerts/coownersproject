import { Redis } from "@upstash/redis";
import { LiveAlert } from "@/lib/types";

export const hasRedisConfig = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!hasRedisConfig) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not configured"
    );
  }
  if (!redis) {
    redis = Redis.fromEnv();
  }
  return redis;
}

// Price tier state: which threshold band an asset's 24h change currently
// sits in, so we alert once per threshold crossing instead of every cron
// tick while the price stays in the same band.
export type PriceTier = "up10" | "up5" | "none" | "down5" | "down10";

export async function getPriceTier(symbol: string): Promise<PriceTier> {
  const value = await getRedis().get<PriceTier>(`alerts:price-tier:${symbol}`);
  return value ?? "none";
}

export async function setPriceTier(symbol: string, tier: PriceTier): Promise<void> {
  await getRedis().set(`alerts:price-tier:${symbol}`, tier);
}

// Round-number level state: the last $-increment level an asset's price
// was seen at (e.g. 72000 for BTC), so we only alert once per level
// crossed, not on every check while hovering near it. null = not seen yet
// (cold start — first run seeds this without firing).
export async function getLastPriceLevel(symbol: string): Promise<number | null> {
  return await getRedis().get<number>(`alerts:price-level:${symbol}`);
}

export async function setLastPriceLevel(symbol: string, level: number): Promise<void> {
  await getRedis().set(`alerts:price-level:${symbol}`, level);
}

// Recent fired alerts, shown read-only on the dashboard — mirrors what was
// sent to Discord. Newest first, capped to the last 20.
const RECENT_ALERTS_KEY = "alerts:recent";
const MAX_RECENT_ALERTS = 20;

export async function pushRecentAlerts(alerts: LiveAlert[]): Promise<void> {
  if (alerts.length === 0) return;
  const client = getRedis();
  const [first, ...rest] = alerts.map((a) => JSON.stringify(a));
  await client.lpush(RECENT_ALERTS_KEY, first, ...rest);
  await client.ltrim(RECENT_ALERTS_KEY, 0, MAX_RECENT_ALERTS - 1);
}

export async function pingRedis(): Promise<boolean> {
  if (!hasRedisConfig) return false;
  try {
    await getRedis().ping();
    return true;
  } catch (err) {
    console.error("[redis] ping failed:", err);
    return false;
  }
}

export async function getRecentAlerts(): Promise<LiveAlert[]> {
  if (!hasRedisConfig) return [];
  const raw = await getRedis().lrange<string>(RECENT_ALERTS_KEY, 0, MAX_RECENT_ALERTS - 1);
  return raw.map((entry) =>
    typeof entry === "string" ? (JSON.parse(entry) as LiveAlert) : (entry as LiveAlert)
  );
}
