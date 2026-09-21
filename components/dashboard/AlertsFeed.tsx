import { LiveAlert } from "@/lib/types";
import { formatRelativeTime } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";

const KIND_ICON: Record<LiveAlert["kind"], string> = {
  PRICE_ALERT: "📊",
  VOLUME_ALERT: "⚡",
  WHALE_ALERT: "🐋",
  NEWS_ALERT: "📰",
  LIQUIDATION_ALERT: "💥",
  VOLATILITY_ALERT: "📉",
};

const SEVERITY_DOT: Record<LiveAlert["severity"], string> = {
  positive: "bg-tl-positive",
  negative: "bg-tl-negative",
  warning: "bg-tl-warning",
  info: "bg-tl-info",
};

// Mirrors what the automated engine posts to Discord (BTC/ETH 24h moves
// past +-5%/+-10%, and round-number price levels like "BTC broke $72,000")
// — read-only, sourced from the same fired-alert log in Redis. Not
// configurable from the site.
export function AlertsFeed({
  alerts,
  configured,
}: {
  alerts: LiveAlert[];
  configured: boolean;
}) {
  return (
    <Card>
      <CardHeader title="Recent Alerts" />
      {!configured ? (
        <p className="text-sm text-tl-text-muted">
          The automated alert engine isn&apos;t configured yet — see Settings.
        </p>
      ) : alerts.length === 0 ? (
        <p className="text-sm text-tl-text-muted">
          No alerts fired yet. BTC/ETH moves past ±5%/±10% in 24h, or a
          round-number price level (e.g. every $1,000 for BTC), are posted
          to Discord automatically.
        </p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((alert) => (
            <li key={alert.id} className="flex items-start gap-3">
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${SEVERITY_DOT[alert.severity]}`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-tl-text-primary">
                  <span className="mr-1">{KIND_ICON[alert.kind]}</span>
                  {alert.message}
                </div>
                <div className="text-xs text-tl-text-muted">
                  {formatRelativeTime(alert.timestamp)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
