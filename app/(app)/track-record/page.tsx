import { getRecentAlerts, hasRedisConfig } from "@/lib/alerts/redis";
import { hasDiscordWebhook } from "@/lib/alerts/discord";
import { marketProvider } from "@/lib/providers";
import { formatPct, formatRelativeTime } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function TrackRecordPage() {
  const configured = hasRedisConfig && hasDiscordWebhook;
  const alerts = configured ? await getRecentAlerts().catch(() => []) : [];

  const symbols = Array.from(
    new Set(alerts.map((a) => a.symbol).filter((s): s is string => Boolean(s)))
  );
  const tickers = symbols.length > 0 ? await marketProvider.getTickers(symbols).catch(() => []) : [];
  const priceBySymbol = new Map(tickers.map((t) => [t.symbol, t.price]));

  const scored = alerts
    .filter((a) => a.priceAtFire !== undefined && a.symbol)
    .map((a) => {
      const currentPrice = priceBySymbol.get(a.symbol!);
      if (currentPrice === undefined) return null;
      const pctSince = ((currentPrice - a.priceAtFire!) / a.priceAtFire!) * 100;
      // The alert's own severity encodes its directional call (positive =
      // called a move up, negative = called a move down) — "correct" means
      // price has kept moving that way since, not that it hit any target.
      const calledUp = a.severity === "positive";
      const correct = calledUp ? pctSince > 0 : pctSince < 0;
      return { alert: a, pctSince, correct };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const winRate = scored.length > 0 ? (scored.filter((s) => s.correct).length / scored.length) * 100 : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 10 · Verified Track Record</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Track Record</h1>
        <p className="text-sm text-tl-text-secondary">
          Every automated alert this site has fired, and what the price
          actually did afterward — wins and losses both shown, nothing
          hidden. &quot;Correct&quot; means price kept moving the direction
          the alert called, not that it hit any specific target.
        </p>
      </div>

      {!configured ? (
        <Card>
          <p className="text-sm text-tl-text-muted">
            The automated alert engine isn&apos;t configured on this
            deployment yet — see Settings.
          </p>
        </Card>
      ) : (
        <>
          <Card label="stats.sh">
            <CardHeader title="Live Win Rate" />
            {winRate === null ? (
              <p className="text-sm text-tl-text-muted">
                No scoreable alerts yet — check back once a few have fired.
              </p>
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tl-mono text-tl-text-primary">
                  {winRate.toFixed(1)}%
                </span>
                <span className="text-sm text-tl-text-secondary">
                  of {scored.length} scoreable alerts still moving the called direction
                </span>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title="Alert History" />
            {alerts.length === 0 ? (
              <p className="text-sm text-tl-text-muted">No alerts fired yet.</p>
            ) : (
              <ul className="divide-y divide-tl-border">
                {alerts.map((alert) => {
                  const score = scored.find((s) => s.alert.id === alert.id);
                  return (
                    <li key={alert.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                      <div>
                        <div className="text-tl-text-primary">{alert.message}</div>
                        <div className="text-xs text-tl-text-muted">
                          {formatRelativeTime(alert.timestamp)}
                        </div>
                      </div>
                      {score ? (
                        <Badge tone={score.correct ? "positive" : "negative"}>
                          {formatPct(score.pctSince)} since
                        </Badge>
                      ) : (
                        <Badge tone="neutral">No price data</Badge>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
