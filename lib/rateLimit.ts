import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { hasRedisConfig } from "@/lib/alerts/redis";

// Protects public API routes that sit in front of rate-limited free-tier
// providers (CoinGecko, Etherscan) — without this, a single scraper hitting
// /api/tickers or /api/whales hard could burn through the shared quota for
// every visitor. Without Redis configured, rate limiting is skipped rather
// than failing closed (a misconfigured env var shouldn't take the site down).
let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit {
  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(30, "60 s"),
      prefix: "ratelimit:api",
    });
  }
  return limiter;
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; remaining: number }> {
  if (!hasRedisConfig) return { success: true, remaining: 1 };
  try {
    const { success, remaining } = await getLimiter().limit(identifier);
    return { success, remaining };
  } catch (err) {
    // Rate limiting is a protective extra, not core functionality — if
    // Redis itself is unreachable or misconfigured, fail OPEN (allow the
    // request) rather than taking down a public API route over it. Log it
    // so a persistently broken Redis connection doesn't go unnoticed.
    console.error("[rateLimit] Redis check failed, allowing request:", err);
    return { success: true, remaining: 1 };
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
