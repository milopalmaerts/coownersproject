import { NextResponse } from "next/server";
import { marketProvider } from "@/lib/providers";
import { evaluatePriceAlerts } from "@/lib/alerts/priceAlerts";
import { evaluateRoundNumberAlerts } from "@/lib/alerts/roundNumberAlerts";
import { hasRedisConfig, pushRecentAlerts } from "@/lib/alerts/redis";
import { hasDiscordWebhook } from "@/lib/alerts/discord";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Called on a schedule (Upstash QStash, e.g. every 5 minutes — see README)
// rather than by users. Checks BTC/ETH 24h % moves against +-5%/+-10%
// thresholds and round-number price levels (e.g. "BTC broke $72,000"),
// posts new crossings to Discord, and logs what fired so the dashboard can
// show it too. No news alerts — price moves only, by request.
export async function GET(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get("x-cron-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasRedisConfig || !hasDiscordWebhook) {
    return NextResponse.json(
      {
        error:
          "Alert engine not configured — set UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN and DISCORD_WEBHOOK_URL",
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

    return NextResponse.json({ fired: fired.length });
  } catch (err) {
    console.error("[discord-alerts cron] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
