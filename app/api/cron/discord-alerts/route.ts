import { NextResponse } from "next/server";
import { derivativesProvider, marketProvider } from "@/lib/providers";
import { evaluatePriceAlerts } from "@/lib/alerts/priceAlerts";
import { evaluateRoundNumberAlerts } from "@/lib/alerts/roundNumberAlerts";
import { hasRedisConfig, pushRecentAlerts, pushFundingSnapshot } from "@/lib/alerts/redis";
import { hasDiscordWebhook } from "@/lib/alerts/discord";
import { broadcastPush, hasVapidConfig } from "@/lib/push";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Called on a schedule (Upstash QStash, e.g. every 5 minutes — see README)
// rather than by users. Checks BTC/ETH 24h % moves against +-5%/+-10%
// thresholds and round-number price levels (e.g. "BTC broke $72,000"),
// posts new crossings to Discord, and logs what fired so the dashboard can
// show it too. No news alerts — price moves only, by request.
//
// Also snapshots funding rate / open interest per run — Hyperliquid only
// exposes a live snapshot, so this is the only way to build a history for
// the funding/OI chart. Runs independently of the Discord-alert gate below
// (it only needs Redis, not a Discord webhook).
export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let snapshotCount = 0;
  if (hasRedisConfig) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const rates = await derivativesProvider.getFundingRates();
      await Promise.all(
        rates.map((r) =>
          pushFundingSnapshot(r.symbol, {
            time: now,
            fundingRatePct: r.fundingRatePct,
            openInterest: r.openInterest,
          })
        )
      );
      snapshotCount = rates.length;
    } catch (err) {
      console.error("[discord-alerts cron] funding snapshot failed", err);
    }
  }

  if (!hasRedisConfig || !hasDiscordWebhook) {
    return NextResponse.json(
      {
        error:
          "Alert engine not configured — set UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN and DISCORD_WEBHOOK_URL",
        snapshotted: snapshotCount,
      },
      { status: 503 }
    );
  }

  try {
    const tickers = await marketProvider.getTickers(["BTC", "ETH"]);

    const [pctAlerts, levelAlerts] = await Promise.all([
      evaluatePriceAlerts(tickers),
      evaluateRoundNumberAlerts(tickers),
    ]);

    const fired = [...pctAlerts, ...levelAlerts];
    await pushRecentAlerts(fired);

    let pushed = 0;
    if (hasVapidConfig && fired.length > 0) {
      const counts = await Promise.all(
        fired.map((a) => broadcastPush("TradingLegends Alert", a.message, `/markets/${a.symbol}`))
      );
      pushed = Math.max(...counts, 0);
    }

    return NextResponse.json({ fired: fired.length, snapshotted: snapshotCount, pushedTo: pushed });
  } catch (err) {
    console.error("[discord-alerts cron] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
