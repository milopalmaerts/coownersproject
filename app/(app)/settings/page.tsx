import Link from "next/link";
import { hasEtherscanApiKey, hasMarketApiKey, isDemoMode } from "@/lib/providers";
import { hasRedisConfig } from "@/lib/alerts/redis";
import { hasDiscordWebhook } from "@/lib/alerts/discord";
import { getCurrentUser, hasSupabaseConfig } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/auth/actions";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 08 · Config</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Settings</h1>
        <p className="text-sm text-tl-text-secondary">
          Platform configuration and data source status.
        </p>
      </div>

      <Card>
        <CardHeader title="Data Mode" />
        <div className="flex items-center gap-2">
          <Badge tone={isDemoMode ? "warning" : "positive"}>
            {isDemoMode ? "DEMO MODE" : "LIVE"}
          </Badge>
          <span className="text-sm text-tl-text-secondary">
            {isDemoMode
              ? "DEMO_MODE=true is set. Showing sample data."
              : "Connected to live market data (CoinGecko + Binance)."}
          </span>
        </div>
        {!isDemoMode && !hasMarketApiKey && (
          <p className="text-xs text-tl-warning mt-3">
            Running on CoinGecko&apos;s keyless public API (~10-30 calls/min,
            shared per IP). Fine for development, but CoinGecko does not
            recommend this for production traffic. Set MARKET_API_KEY to a
            free Demo API key before launching publicly.
          </p>
        )}
      </Card>

      <Card>
        <CardHeader title="Automated Alert Engine" />
        <p className="text-sm text-tl-text-secondary mb-3">
          Posts to Discord automatically when BTC/ETH move past ±5%/±10% in
          24h, or cross a round-number price level (e.g. every $1,000 for
          BTC, $100 for ETH). Checked on a schedule (Upstash QStash) —
          there is no personal alert builder on this site.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <Badge tone={hasRedisConfig ? "positive" : "neutral"}>
              {hasRedisConfig ? "CONFIGURED" : "NOT SET"}
            </Badge>
            <span className="text-tl-text-secondary">
              Upstash Redis (alert state)
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Badge tone={hasDiscordWebhook ? "positive" : "neutral"}>
              {hasDiscordWebhook ? "CONFIGURED" : "NOT SET"}
            </Badge>
            <span className="text-tl-text-secondary">Discord webhook</span>
          </li>
        </ul>
        {(!hasRedisConfig || !hasDiscordWebhook) && (
          <p className="text-xs text-tl-warning mt-3">
            Set UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN and
            DISCORD_WEBHOOK_URL, then schedule GET /api/cron/discord-alerts
            (with header x-cron-secret) every few minutes — see README.
          </p>
        )}
      </Card>

      <Card>
        <CardHeader title="Whale Monitoring" />
        <div className="flex items-center gap-2">
          <Badge tone={hasEtherscanApiKey ? "positive" : "neutral"}>
            {hasEtherscanApiKey ? "BTC + ETH" : "BTC ONLY"}
          </Badge>
          <span className="text-sm text-tl-text-secondary">
            {hasEtherscanApiKey
              ? "Etherscan key set — detecting BTC and ETH whale transactions."
              : "Set ETHERSCAN_API_KEY to also detect ETH whale transactions."}
          </span>
        </div>
      </Card>

      <Card>
        <CardHeader title="Account" />
        {!hasSupabaseConfig ? (
          <p className="text-sm text-tl-text-muted">
            Accounts aren&apos;t configured on this deployment
            (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not
            set). Watchlist stays in this browser&apos;s localStorage.
          </p>
        ) : user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge tone="positive">SIGNED IN</Badge>
              <span className="text-sm text-tl-text-secondary">{user.email}</span>
            </div>
            <p className="text-sm text-tl-text-muted">
              Your watchlist is saved to your account and follows you across
              devices.
            </p>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-tl-border text-tl-text-secondary hover:border-tl-negative/50 hover:text-tl-negative transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">NOT SIGNED IN</Badge>
              <span className="text-sm text-tl-text-secondary">
                Watchlist is stored locally in this browser only.
              </span>
            </div>
            <Link
              href="/login"
              className="inline-block text-xs font-medium px-3 py-1.5 rounded-lg bg-tl-accent text-black hover:opacity-90 transition-opacity"
            >
              Sign in to sync your watchlist
            </Link>
          </div>
        )}
        <p className="text-xs text-tl-text-muted mt-3">
          Alerts are global (BTC/ETH price moves) and posted to Discord for
          everyone, not tied to an account.
        </p>
      </Card>
    </div>
  );
}
