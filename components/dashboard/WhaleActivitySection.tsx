import { whaleProvider } from "@/lib/providers";
import { formatRelativeTime, formatUsd } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { isMegaWhale } from "@/lib/whaleThresholds";
import { WhaleSoundAlert } from "@/components/dashboard/WhaleSoundAlert";

// Its own async component (not inlined in the page) so it can sit behind a
// Suspense boundary and stream in independently — a slow whale-block scan
// no longer blocks price cards from painting immediately.
export async function WhaleActivitySection() {
  const whaleTxs = await whaleProvider.getLargeTransactions(4).catch(() => []);

  return (
    <Card>
      <CardHeader title="Live Market Activity" action={<WhaleSoundAlert />} />
      {whaleTxs.length === 0 ? (
        <p className="text-sm text-tl-text-muted">
          No whale-sized transactions detected in the latest blocks.
        </p>
      ) : (
        <ul className="divide-y divide-tl-border">
          {whaleTxs.map((tx) => {
            const mega = isMegaWhale(tx.symbol, tx.usdValue);
            return (
            <li
              key={tx.id}
              className={`flex items-center justify-between py-2.5 px-2 -mx-2 text-sm rounded-lg ${
                mega ? "tl-mega-whale border" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span>🐋</span>
                <span className="text-tl-text-primary font-medium">
                  {tx.symbol}
                </span>
                <span className="text-tl-text-secondary">
                  {tx.fromLabel} → {tx.toLabel}
                </span>
                {mega && <Badge tone="warning">MEGA</Badge>}
              </div>
              <div className="flex items-center gap-3">
                <span className="tabular-nums text-tl-text-primary">
                  {formatUsd(tx.usdValue)}
                </span>
                <span className="text-xs text-tl-text-muted">
                  {formatRelativeTime(tx.timestamp)}
                </span>
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
