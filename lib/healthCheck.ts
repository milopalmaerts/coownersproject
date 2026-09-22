// Lightweight, live pings against each upstream data source — run fresh on
// every Settings page load rather than cached/stored, so this always
// reflects what's actually happening right now, never a stale "last known
// good" that quietly goes wrong. Each check has its own short timeout so one
// slow provider can't stall the whole page.
export interface HealthCheckResult {
  name: string;
  ok: boolean;
  latencyMs: number | null;
  detail?: string;
}

async function timedFetch(url: string, options?: RequestInit, timeoutMs = 5000): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
    return { ok: res.ok, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  } finally {
    clearTimeout(timeout);
  }
}

async function check(name: string, url: string, options?: RequestInit): Promise<HealthCheckResult> {
  const { ok, latencyMs } = await timedFetch(url, options);
  return { name, ok, latencyMs: ok ? latencyMs : null, detail: ok ? undefined : "Unreachable or slow" };
}

export async function runHealthChecks(hasEtherscanKey: boolean): Promise<HealthCheckResult[]> {
  const { hasRedisConfig, pingRedis } = await import("@/lib/alerts/redis");

  const checks: Promise<HealthCheckResult>[] = [
    check("CoinGecko", "https://api.coingecko.com/api/v3/ping"),
    check("Binance", "https://api.binance.com/api/v3/ping"),
    check("mempool.space (BTC whales)", "https://mempool.space/api/blocks/tip/height"),
    check("Hyperliquid", "https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "meta" }),
    }),
    check(
      "Economic calendar",
      "https://nfs.faireconomy.media/ff_calendar_thisweek.json"
    ),
  ];

  if (hasRedisConfig) {
    checks.push(
      (async () => {
        const start = Date.now();
        const ok = await pingRedis();
        return {
          name: "Upstash Redis (alerts + rate limit)",
          ok,
          latencyMs: ok ? Date.now() - start : null,
          detail: ok ? undefined : "Auth failed or unreachable — check UPSTASH_REDIS_REST_URL/TOKEN",
        };
      })()
    );
  }

  if (hasEtherscanKey) {
    checks.push(
      check(
        "Etherscan (ETH whales)",
        `https://api.etherscan.io/v2/api?chainid=1&module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`
      )
    );
  }

  return Promise.all(checks);
}
